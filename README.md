# FOLLOWTX

This library want's to fix the problem of the impaciencie of our users. One of the most common cases on the transactions are the loading page to waiting the end of the transaction, with this library each user has a global state of his transactions and the dapp can notify when they are finish.
The user don't need stay on the same screen and he can close the navigator and check later because the library store the transactions in localSotrage and check when the user is back.

## Getting Started

### 1. Install Particle CLI

```
$ npm install followtx
```

### 2. Init new library

```
import FollowTx form 'followTx';

const web3 = new Web3('wss://{ kovan | mainnet }.infura.io/ws/v3/{your_token}');
const followTx = new FollowTx(web3);

//Global scope
followTx.on('tx_start',(tx,obj) => { // on start transaction
    console.log('Global transaction watcher',tx);
});

followTx.on('tx_finish',(tx, obj) => { // when the transaction was finished and success
    console.log('Global transaction watcher',tx);
});

followTx.on('tx_error',(tx, obj) => { // on transaction error
    console.log('Global transaction watcher',tx);
});
```

### 3. Wrapp the transaction to follow

```
const followTx = new FollowTx(web3);

followTx.watchTx(
    contract.methods.depositFor(address).send({ from: address }),// Transaction - Required
    {message:'finish transaction deposit'}, // Options - Optional: add objet to pass to the result event
    'deposit_1234' // ID - Optional: add a identifier of this transaction, must be unique.
).on('tx_start',(hash, obj ) => {
    console.log('Local transaction',hash);
});

```

### 4. Check if the transaction is pending

```
const followTx = new FollowTx(web3);

/*
	To check if you have pending transactions you need to define the 
	ID param on the wathTx function
*/
if(!followTx.hasPendingTx('deposit')){ 
    console.log('The transaction from deposit is pending');
}

```

## Events

Global Events:

- tx_start
- tx_finish
- tx_error

Events on method (watchTx):

- tx_start
- tx_finish
- tx_error
