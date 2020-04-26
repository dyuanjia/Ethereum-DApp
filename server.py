from flask import Flask, request, abort
from solcx import compile_source
from web3.auto import w3
import json

app = Flask(__name__)

# BlindAuction
contract_source_code = None
contract_source_code_file = './src/contracts/BlindAuction.sol'
with open(contract_source_code_file, 'r') as file:
    contract_source_code = file.read()

contract_compiled = compile_source(contract_source_code)
contract_interface = contract_compiled['<stdin>:BlindAuction']
CoinToss = w3.eth.contract(abi=contract_interface['abi'],
                           bytecode=contract_interface['bin'])
developer = w3.eth.accounts[0]
# w3.personal.unlockAccount(w3.eth.accounts[0], '') #  Not needed with Ganache
# tx_hash = CoinToss.constructor().transact({'from': w3.eth.accounts[0]})
# tx_receipt = w3.eth.waitForTransactionReceipt(tx_hash)
# coinToss = w3.eth.contract(
#     address=tx_receipt.contractAddress, abi=contract_interface['abi'])

# Payment
contract_source_code_file = './src/contracts/Payment.sol'
with open(contract_source_code_file, 'r') as file:
    contract_source_code = file.read()
payment_compiled = compile_source(contract_source_code)
payment_interface = payment_compiled['<stdin>:Payment']
Payment = w3.eth.contract(abi=payment_interface['abi'],
                          bytecode=payment_interface['bin'])
# name = 'Toss Coin'
# symbol = 'MLC'
# supply = 1000000
# tx_hash = Token.constructor(name, symbol, 0, supply).transact({
#     'from': w3.eth.accounts[0]})
# tx_receipt = w3.eth.waitForTransactionReceipt(tx_hash)
# token = w3.eth.contract(
#     address=tx_receipt.contractAddress, abi=erc20_interface['abi'])


# Keeping track of active auction
activeAuction = None


@app.before_request
def limit_remote_addr():
    if request.remote_addr != '127.0.0.1':
        abort(403)


@app.route('/')
@app.route('/index', methods=['GET'])
def index():
    return {'activeAuction': False}
    # return render_template('template.html', contractAddress=coinToss.address.lower(), contractABI=json.dumps(contract_interface['abi']))


@app.route('/create', methods=['GET', 'POST'])
def create():
    if (request.method == 'POST'):
        return {'what': True}
    else:
        if (activeAuction):
            return {'activeAuction': True}
        else:
            return {'activeAuction': False}

    # return render_template('template_ico.html',
    #                        contractAddress=token.address.lower(),
    #                        contractABI=json.dumps(erc20_interface['abi']),
    #                        name=name,
    #                        symbol=symbol)


if __name__ == '__main__':
    app.run()
