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

const web3 = ....
const followTx = new FollowTx(web3);

//Global scope
followTx.on('tx_start',(tx) => {
    console.log('Global transaction watcher',tx);
});


```

### 3. Wrapp the transaction to follow

```
const followTx = new FollowTx(web3);

followTx.watchTx(
    contract.methods.depositFor(address).send({ from: address }),
    'deposit'
).on('tx_start',(hash) => {
    console.log('Local transaction',hash);
});

```

### 4. Check if the transaction is pending

```
const followTx = new FollowTx(web3);

if(!followTx.hasPendingTx('deposit')){
    console.log('The transaction from deposit is pending');
}

```

## Events

Global Events:

- tx_start
- tx_finish

Events on method (watchTx):

- tx_start
- tx_finish
