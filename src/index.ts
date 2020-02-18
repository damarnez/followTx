import { EventEmitter } from 'events';

// @ts-nocheck
class FollowTx extends EventEmitter {
  private connection: any = null;
  private storeName: string = 'tx';
  private storage: any = null;

  public constructor(web3Conn: any) {
    super();
    this.connection = web3Conn;
    this.storage = window.localStorage;
    if (!this.storage.getItem(this.storeName)) {
      this.storage.setItem(this.storeName, '[]');
    }
    this.lastTx();
  }

  private async lastTx() {
    const self = this;
    const data = JSON.parse(this.storage.getItem(this.storeName));
    // All the transaction was checked
    if (data.length === 0) return;
    const res = await Promise.all(
      data.map(hash =>
        self.connection.eth.getTransactionReceipt(self.getHash(hash))
      )
    );

    res.filter(el => el).map((el: any) => self.remove(el.transactionHash));
    // check again pass 2 seconds
    setTimeout(() => self.lastTx(), 2000);
  }

  private mixNameAndHash(name: string, hash: string) {
    return name ? `${name}:${hash}` : hash;
  }

  public getHash(token: string) {
    return token.split(':').pop();
  }

  private getName(token: string) {
    if (token) {
      return token.split(':')[0];
    } else {
      return;
    }
  }

  private save(token: string) {
    const data = JSON.parse(this.storage.getItem(this.storeName));
    data.push(token);
    this.storage.setItem(this.storeName, JSON.stringify(data));
    this.emit('tx_start', this.getHash(token));
  }

  private remove(token: string) {
    const data = JSON.parse(this.storage.getItem(this.storeName));
    this.storage.setItem(
      this.storeName,
      JSON.stringify(
        data.filter(value => this.getHash(value) !== this.getHash(token))
      )
    );
    this.emit('tx_finish', this.getHash(token));
  }
  public hasPendingTx(name: string) {
    const data = JSON.parse(this.storage.getItem(this.storeName));
    return data
      .filter(value => this.getName(value) === this.getName(name))
      .pop();
  }

  // @ts-ignore
  public watchTx(method: any, name?: string) {
    const self = this;
    return method
      .on('transactionHash', function(hash) {
        self.save(self.mixNameAndHash(name, hash));
        this.emit('tx_start', hash);
      })
      .on('receipt', function(receipt) {
        self.remove(self.mixNameAndHash(name, receipt.transactionHash));
        this.emit('tx_finished');
      })
      .on('error', function(error) {
        this.emit('tx_finished');
      });
  }
}
export default FollowTx;
