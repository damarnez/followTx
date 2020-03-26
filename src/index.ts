import { EventEmitter } from "events";

const EventNames = {
  Start: "tx_start",
  Finish: "tx_finish",
  Error: "tx_error"
};

const STORAGENAME = "tx";
const EXTRANAME = "ex";

// @ts-nocheck
class FollowTx extends EventEmitter {
  private connection: any = null;

  private storage: any = null;

  public constructor(web3Conn: any) {
    super();
    this.connection = web3Conn;
    this.storage = window.localStorage;
    if (!this.storage.getItem(STORAGENAME)) {
      this.storage.setItem(STORAGENAME, "[]");
    }
    this.lastTx();
  }

  private async lastTx() {
    const self = this;
    const data: any = JSON.parse(this.storage.getItem(STORAGENAME));
    // All the transaction was checked
    if (data.length === 0) return;
    const res = await Promise.all(
      data.map((hash: any) =>
        self.connection.eth.getTransactionReceipt(self.getHash(hash))
      )
    );

    res
      .filter(el => el)
      .map((el: any) => {
        const hash = el.transactionHash;
        self.notify(hash, EventNames.Finish);
        self.remove(hash);
      });
    // check again pass 2 seconds
    setTimeout(() => self.lastTx(), 2000);
  }

  private mixIdAndHash(id: any, hash: string) {
    return id ? `${id}:${hash}` : hash;
  }

  public getHash(token: string) {
    return token.split(":").pop();
  }

  private getName(token: string) {
    return token.split(":")[0];
  }

  private save(token: string, options: any) {
    try {
      const data = JSON.parse(this.storage.getItem(STORAGENAME));
      data.push(token);
      this.storage.setItem(STORAGENAME, JSON.stringify(data));
      //We store extra information
      this.storage.setItem(`${EXTRANAME}_${token}`, JSON.stringify(options));
    } catch (error) {
      this.storage.setItem(STORAGENAME, "[]");
      this.storage.removeItem(`${EXTRANAME}_${token}`);
      console.error(
        "[FollowTx][save] Error on parse JSON we remove the local storage to don/'t propagate the error",
        error
      );
    }
  }
  private notify(token: string, event: string) {
    try {
      const extra = JSON.parse(this.storage.getItem(`${EXTRANAME}_${token}`));
      this.emit(event, this.getHash(token), extra);
    } catch (error) {
      this.storage.removeItem(`${EXTRANAME}_${token}`);
      console.error(
        "[FollowTx][notify] Error on parse JSON we remove the local storage to don/'t propagate the error",
        error
      );
    }
  }
  private remove(token: string) {
    try {
      const data = JSON.parse(this.storage.getItem(STORAGENAME));
      this.storage.setItem(
        STORAGENAME,
        JSON.stringify(
          data.filter(
            (value: any) => this.getHash(value) !== this.getHash(token)
          )
        )
      );
      //Remove the extra storage
      this.storage.removeItem(`${EXTRANAME}_${token}`);
    } catch (error) {
      this.storage.setItem(STORAGENAME, "[]");
      this.storage.removeItem(`${EXTRANAME}_${token}`);
      console.error(
        "[FollowTx][removeItem] Error on parse JSON we remove the local storage to don/'t propagate the error",
        error
      );
    }
  }
  public hasPendingTx(id: string) {
    try {
      const data = JSON.parse(this.storage.getItem(STORAGENAME));
      return data
        .filter((value: any) => this.getName(value) === this.getName(id))
        .pop();
    } catch (error) {
      this.storage.setItem(STORAGENAME, "[]");
      console.error(
        "[FollowTx][hashPendingTx] Error on parse JSON we remove the local storage to don/'t propagate the error",
        error
      );
    }
  }

  // @ts-ignore
  public watchTx(method: any, opt: any, id: string) {
    const self = this;
    const options = opt || {};
    return method
      .on("transactionHash", function(hash: any) {
        self.save(self.mixIdAndHash(id, hash), options);
        self.notify(self.mixIdAndHash(id, hash), EventNames.Start);
        //@ts-ignore
        this.emit(EventNames.Start, hash);
      })
      .on("receipt", function(receipt: any) {
        const hash = receipt.transactionHash;
        self.notify(hash, EventNames.Finish);
        //@ts-ignore
        this.emit(EventNames.Finish, hash, options);
        //Once the events are emmited remove
        self.remove(self.mixIdAndHash(id, hash));
      })
      .on("error", function(error: any) {
        if (error.receipt && error.receipt.transactionHash) {
          const hash = error.receipt.transactionHash;
          self.notify(self.mixIdAndHash(id, hash), EventNames.Error);
          self.remove(self.mixIdAndHash(id, hash));
        }
        //@ts-ignore
        this.emit(EventNames.Error, error, options);
      });
  }
}
export default FollowTx;