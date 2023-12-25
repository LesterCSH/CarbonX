//module
const fs = require('fs');
const { exitCode } = require('process');
const {Web3} = require('web3');
const web3 = new Web3("HTTP://127.0.0.1:7545");
const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
});
const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));

//control of JSON file
function addCompanyToDatabase(newCompany) {
    fs.readFile('./companyData.json', (err, info) => {
        if (err) return console.error(err);
        var data = info.toString();
        data = JSON.parse(data);
        data.info.push(newCompany);
        data.total = data.info.length;
        //console.log(data.info);
        var str = JSON.stringify(data);
        fs.writeFile('./companyData.json', str, (err) => {
            if (err) console.error(err);
            //console.log(`Sussecfully add new company named ${newCompany} to company list.`)
        })
    })
}

function deleteCompanyFromDatabase(companyID) {
    fs.readFile('./companyData.json', function (err, info) {
        if (err) return console.error(err);
        var data = info.toString();
        data = JSON.parse(data);
        for (var i = 0; i < data.info.length; i++) {
            if (companyID == data.info[i].id) user.userInfo.splice(i, 1);
        }
        console.log(user.info);
        var str = JSON.stringify(user);
        fs.writeFile('./companyData.json', str, function (err) {
            if (err) console.error(err);
            console.log(`Successfully delete id = ${id} of company in company list.`);
        })
    })
}

async function modifyCredit(companyID, numOfCredit) {
    numOfCredit = parseFloat(numOfCredit);
        fs.readFile('./companyData.json', function (err, info) {
            if (err) return console.error(err);
            var user = info.toString();
            user = JSON.parse(user);
            for (var i = 0; i < user.info.length; i++) {
                if (companyID == user.info[i].id) user.info[i].credit += numOfCredit;
            }
            //console.log(user.info);
            var str = JSON.stringify(user);
            fs.writeFile('./companyData.json', str, function (err) {
                if (err) console.error(err);
            });
        });
}

async function transactionCredit(infoData) {
        fs.readFile('./companyData.json', function (err, info) {
            if (err) return console.error(err);
            var user = info.toString();
            user = JSON.parse(user);
            for (var i = 0; i < user.info.length; i++) {
                if (infoData.fromID == user.info[i].id) {
                    user.info[i].credit -= infoData.value*1.01;
                    if (user.info[i].credit < 0) return console.error(1);
                }
                if (infoData.toID == user.info[i].id) user.info[i].credit += infoData.value;
            }
            //console.log(user.info);
            var str = JSON.stringify(user);
            fs.writeFile('./companyData.json', str, function (err) {
                if (err) console.error(err);
            })
        })
}

function verifyPassword(companyID, password) {
    var data = require('./companyData.json');
    for(var i = 0; i < data.info.length; i++) {
        if(data.info[i].id == companyID){
            if(data.info[i].password == password) return true;
        }
    }
    return false;
}

function findCompanyName(companyID) {
    var data = require('./companyData.json');
    for(var i = 0; i < data.info.length; i++) {
        if(data.info[i].id == companyID){
            //console.log('found name');
            return data.info[i].companyName;
        }
    }
    return false;
}

function findCompanyAddress(companyID) {
    var data = require('./companyData.json');
    for(var i = 0; i < data.info.length; i++) {
        if(data.info[i].id == companyID){
            //console.log('found name');
            return data.info[i].ethAccount;
        }
    }
    return false;
}

function findCompanyID(companyName) {
    var data = require('./companyData.json');
    for(var i = 0; i < data.info.length; i++) {
        if(data.info[i].companyName == companyName){
            //console.log('found id');
            return data.info[i].id;
        }
    }
    return false;
}

async function login() {
    try {
        var companyID = await prompt('Company id:\n');
        console.clear();
        var password = await prompt('password:\n');
        console.clear();
        var res = verifyPassword(companyID, web3.utils.sha3(password));
        if(res){
            console.log('Login successful!');
        }else{
            console.log('Login failed!');
        }
    } catch (error) {console.log(error);}
    return {res, companyID};
}

async function register() {
    try {
        var name = await prompt('Enter your company name:\n');
        console.clear();
        var password = await prompt('Create your password:\n');
        console.clear();
        console.log(`Your company ${name} register successfully!`);
        var data = require('./companyData.json');
        var companyID = data.info[data.info.length-1].id + 1;
        web3.eth.getAccounts().then(res => {
            var account = res[companyID];
            addCompanyToDatabase({'id': companyID, 'companyName': name, 'password': web3.utils.sha3(password), 'ethAccount': account, 'credit': 0});
            console.log(`Your companyID is: ${companyID}`);
            console.log(`Your ETH account is: ${account}`);
            console.log('Ctrl+D to exit');

        });
    } catch (error) {console.log(error);}
}

async function transaction(address, id){
    id = parseInt(id);
    var data = require('./companyData.json');
    console.log('----Option of transaction----');
    console.log('Option 1 (testing): buy carbon credit from CarbonX');
    console.log('Option 2: send Carbon credit');
    console.log('Option 3: send Ethereum');
    //console.log('Option 4: change your company name');
    console.log('Ctrl+D to exit');
    var option = await prompt('Input your option: ');
    console.clear();
    if (option == '1' && false){
        var numOfCredit = await prompt('Number of Carbon credit you need to buy: ');
        numOfCredit = parseFloat(numOfCredit);
        var fee = numOfCredit / 100;
        var totalPay = numOfCredit + fee;
        console.log('Declare:');
        console.log(`You are going to buy ${numOfCredit} Carbon credit.`);
        console.log(`You need to pay extra 1% (${fee} ETH) of transaction fee.`);
        console.log('You need to pay 20000000000 per 1 ETH of gas price')
        console.log(`You need to pay total ${totalPay} ETH + some gas price.`);
        var ask = await prompt('Contionue? (y/n)');
        console.clear();
        if(ask == 'y'){
            web3.eth.sendTransaction({
                'from' : address,
                'to' : data.info[0].ethAccount,
                'value': web3.utils.toWei(totalPay, 'ether')
            }).then(msg => {
                //console.log(msg);
                console.log('Transaction successful!');
                console.log(`Gas price: ${msg.effectiveGasPrice} Wei ETH`);
                totalPay += parseFloat(web3.utils.fromWei(msg.effectiveGasPrice, 'ether'));
                console.log(`You have paid ${totalPay}`);
                modifyCredit(id, numOfCredit).then(val =>{
                    console.log(`Carbon credit you have brought: ${numOfCredit}`)
                    console.log('Thank you!');
                    console.log('Ctrl+D to exit');
                });
            }).catch(err => {
                console.log('Transaction failed.');
                console.log('Ctrl+D to exit');
            })
        } else {
            console.log('Cancelled!');
            console.log('Ctrl+D to exit');
        }
    } else if(option == '2'){
        var toID = await prompt('Transaction to company ID: ');
        var toCompany = findCompanyName(toID);
        var value = await prompt('Transaction value (Carbon credit): ');
        value = parseFloat(value);
        var fee = value / 100;
        console.log('Declare:');
        console.log(`You are going to transaction ${value} of Carbon credit to ${toCompany}.`)
        console.log(`You need to pay extra 1% (${fee} Carbon) of transaction fee.`);
        var ask = await prompt('Contionue? (y/n)');
        console.clear();
        if(ask == 'y'){
            if(data.info[id].credit-(value+fee)>=0){
                console.log(id);
                transactionCredit({
                    'fromID': id,
                    'toID': toID,
                    'value': value
                }).then(res => {
                    console.log('Transaction successful!');
                    console.log(`You have sent ${value} of Carbon credit to ${toCompany}.`);
                    value += fee;
                    console.log(`You have paid ${value} of Carbon credit`);
                }).catch(err => {
                    console.log('Transaction failed.');
                    console.log('Ctrl+D to exit');
                });
            } else {
                console.log('Transaction failed');
                console.log('Ctrl+D to exit');
            };
        } else {
            console.log('Cancelled!');
            console.log('Ctrl+D to exit');
        }

    } else if(option == '3'){
        var toID = await prompt('Transaction to company ID: ');
        var toCompany = findCompanyName(toID);
        var toAccount = findCompanyAddress(toID);
        var value = await prompt('Transaction value (ether): ');
        value = parseFloat(value);
        console.log(`You are going to transaction ${value} ETH to ${toCompany}.`)
        var ask = await prompt('Contionue? (y/n)');
        console.clear();
        if(ask == 'y'){
            web3.eth.sendTransaction({
                'from' : address,
                'to' : toAccount,
                'value': web3.utils.toWei(value, 'ether')
            }).then(msg => {
                console.log('Transaction successful!');
                console.log(`Gas price: ${msg.effectiveGasPrice} Wei ETH`);
                value += parseFloat(web3.utils.fromWei(msg.effectiveGasPrice, 'ether'));
                console.log(`You have paid ${value}`);
            }).catch(err => {
                console.log('Transaction failed.');
                console.log('Ctrl+D to exit');
            })
        } else {
            console.log('Cancelled!');
            console.log('Ctrl+D to exit');
        }
    }
}

async function main(){
    var data = require('./companyData.json');
    console.log('Option 1: login');
    console.log('Option 2: register');
    console.log('Option 3: check company ID from companyName');
    console.log('Ctrl+D to exit');
    option = await prompt('Input your option: ');
    console.clear();
    if (option == '1'){
        login().then(info => {if(info.res){web3.eth.getAccounts().then(accArr => {
            var ETHAddress = accArr[info.companyID]
            web3.eth.getBalance(ETHAddress).then(WeiBalance => {
                var ETHBalance = web3.utils.fromWei(WeiBalance, 'ether');
                var companyName = findCompanyName(info.companyID);
                console.log(`Welcome, ${companyName}!`);
                console.log('Account infomation:')
                console.log(`ETH address: ${ETHAddress}`);
                console.log(`Balance: ${ETHBalance} ETH`);
                console.log(`Credit: ${data.info[info.companyID].credit}`)
                transaction(ETHAddress, info.companyID);
            });
        });}})
    } else if (option == '2'){
        register();
    } else if (option == '3'){
        var id = await prompt('Input the company name you need to find: ');
        var res = findCompanyID(id);
        if (res) console.log(`Your company id is "${res} ETH".`);
        else console.log('Company id is not found!');
        console.log('Ctrl+D to exit');
    }
    //process.exit()
}


console.clear();
main()
//web3.eth.getAccounts().then(console.log)
//web3.eth.getBalance('0xD103673f8901289E53DEbA9B91Ad1FF23CC57936').then(console.log)
//web3.eth.getBalance('0xEf1B1Decc2Efd95dc885aD0607324344fb2b1194').then(console.log)
