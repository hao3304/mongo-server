const Base = require('./base.js');

module.exports = class extends Base {
    async indexAction() {
        let data = await this.mongo('message').limit(2).select();
        console.log(data);
        return this.display();
    }

    async searchAction() {
        let where = {};
        let toAddr = this.get('toAddr');
        let begin = this.get('begin');
        let end = this.get('end');
        let ipAddr = this.get('ipAddr');
        let fromAddr = this.get('fromAddr');
        let page = this.get('page')|| 1;
        let status = this.get('status')|| 'send';
        if(toAddr) {
          where['toAddr'] = toAddr;
        }
        if(status) {
          where['status'] = toAddr;
        }
        if(ipAddr) {
            where['toAddr'] = ipAddr;
        }
        if(fromAddr) {
            where['toAddr'] = fromAddr;
        }
        if(begin&&end) {
          where['timestamp'] = {"$gte": parseInt(begin), "$lte": parseInt(end)};
        }
        let data = await this.mongo('message').where(where).page(page,20).countSelect();
        return this.success(data);
    }


};
