from flask import Flask, render_template
from solcx import compile_source
from web3.auto import w3
import json

app = Flask(__name__)

contract_source_code = None
contract_source_code_file = 'contract.sol'

# Compile and deploy smart contract(s) automatically
with open(contract_source_code_file, 'r') as file:
    contract_source_code = file.read()

contract_compiled = compile_source(contract_source_code)
contract_interface = contract_compiled['<stdin>:CoinToss']
CoinToss = w3.eth.contract(abi=contract_interface['abi'],
                           bytecode=contract_interface['bin'])
# w3.personal.unlockAccount(w3.eth.accounts[0], '') #  Not needed with Ganache
tx_hash = CoinToss.constructor().transact({'from': w3.eth.accounts[0]})
tx_receipt = w3.eth.waitForTransactionReceipt(tx_hash)
coinToss = w3.eth.contract(
    address=tx_receipt.contractAddress, abi=contract_interface['abi'])

# ERC20 token standard
with open('ERC20.sol', 'r') as file:
    contract_source_code = file.read()
erc20_compiled = compile_source(contract_source_code)
erc20_interface = erc20_compiled['<stdin>:Token']
Token = w3.eth.contract(abi=erc20_interface['abi'],
                        bytecode=erc20_interface['bin'])
name = 'Toss Coin'
symbol = 'MLC'
supply = 1000000
tx_hash = Token.constructor(name, symbol, 0, supply).transact({
    'from': w3.eth.accounts[0]})
tx_receipt = w3.eth.waitForTransactionReceipt(tx_hash)
token = w3.eth.contract(
    address=tx_receipt.contractAddress, abi=erc20_interface['abi'])


# Web service initialization
@app.route('/')
@app.route('/index')
def hello():
    return render_template('template.html', contractAddress=coinToss.address.lower(), contractABI=json.dumps(contract_interface['abi']))


@app.route('/ico')
def ico():
    return render_template('template_ico.html',
                           contractAddress=token.address.lower(),
                           contractABI=json.dumps(erc20_interface['abi']),
                           name=name,
                           symbol=symbol)


if __name__ == '__main__':
    app.run()
