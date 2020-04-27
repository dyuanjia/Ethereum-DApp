from flask import Flask, request, abort
from solcx import compile_source
from web3.auto import w3
import json

app = Flask(__name__)

# w3.personal.unlockAccount(w3.eth.accounts[0], '') #  Not needed with Ganache
developer = w3.eth.accounts[0]
w3.eth.defaultAccount = developer
# print(w3.eth.getBalance(developer))

# BlindAuction
contract_source_code = None
contract_source_code_file = './src/contracts/BlindAuction.sol'
with open(contract_source_code_file, 'r') as file:
    contract_source_code = file.read()

contract_compiled = compile_source(contract_source_code)
contract_interface = contract_compiled['<stdin>:BlindAuction']
BlindAuction = w3.eth.contract(abi=contract_interface['abi'],
                               bytecode=contract_interface['bin'])

# Payment
contract_source_code_file = './src/contracts/Payment.sol'
with open(contract_source_code_file, 'r') as file:
    contract_source_code = file.read()
payment_compiled = compile_source(contract_source_code)
payment_interface = payment_compiled['<stdin>:Payment']
Payment = w3.eth.contract(abi=payment_interface['abi'],
                          bytecode=payment_interface['bin'])
tx_hash = Payment.constructor().transact({'from': developer})
tx_receipt = w3.eth.waitForTransactionReceipt(tx_hash)
payment = w3.eth.contract(
    address=tx_receipt.contractAddress, abi=payment_interface['abi'])
fee = payment.functions.FEE().call()


def createAuction(name, desc, owner, amt):
    global BlindAuction, contract_interface
    try:
        minBid = w3.toWei(amt, 'ether')
        tx_hash = BlindAuction.constructor(
            name, desc, owner, minBid).transact({'from': developer})
        tx_receipt = w3.eth.waitForTransactionReceipt(tx_hash)
        blindAuction = w3.eth.contract(
            address=tx_receipt.contractAddress, abi=contract_interface['abi'])
        return blindAuction
    except:
        return False


# Keeping track of active auction
activeAuction = None


@app.before_request
def limit_remote_addr():
    if request.remote_addr != '127.0.0.1':
        abort(403)


@app.route('/')
@app.route('/index', methods=['GET'])
def index():
    global activeAuction
    if (activeAuction):
        return {
            'activeAuction': True,
            'auctionAddress': activeAuction.address,
            'paymentAddress': payment.address
        }
    else:
        return {
            'activeAuction': False,
            'auctionAddress': None,
            'paymentAddress': payment.address
        }


@app.route('/create', methods=['GET', 'POST'])
def create():
    global activeAuction, payment, fee
    if (request.method == 'POST'):
        # Retrieve payment
        tx_hash = payment.functions.withdraw().transact()
        tx_receipt = w3.eth.waitForTransactionReceipt(tx_hash)
        # Create new auction
        itemOwner = request.json["owner"]
        blindAuction = createAuction(
            request.json["name"], request.json["desc"], itemOwner, request.json["minBid"])
        if(blindAuction):
            activeAuction = blindAuction
            return {'success': True, 'auctionAddress': activeAuction.address}
        else:
            tx_hash = w3.eth.sendTransaction(
                {'to': itemOwner, 'value': fee})
            tx_receipt = w3.eth.waitForTransactionReceipt(tx_hash)
            return {'success': False}
    else:
        if (activeAuction):
            return {'activeAuction': True}
        else:
            return {'activeAuction': False}


if __name__ == '__main__':
    app.run()
