const Base = require('./base.js');

module.exports = class extends Base {
    async indexAction() {
        let data = await this.mongo('message').limit(2).select();
        console.log(data);
        return this.success(data);
    }

    async searchAction() {
        let where = {};
        let toAddr = this.get('toAddr');
        let begin = this.get('begin');
        let end = this.get('end');
        let ipAddr = this.get('ipAddr');
        let fromAddr = this.get('fromAddr');
        let page = this.get('page')|| 1;
        let status = this.get('status')|| 'sent';
        if(toAddr) {
          where['toAddr'] = toAddr;
        }
        if(status) {
          where['status'] = status;
        }
        if(ipAddr) {
            where['ipAddr'] = ipAddr;
        }
        if(fromAddr) {
            where['fromAddr'] = fromAddr;
        }
        if(begin&&end) {
          where['timestamp'] = {"$gte": parseInt(begin), "$lte": parseInt(end)};
        }
        console.log(where)
        let data = await this.mongo('message').order({'timestamp':-1}).where(where).page(page,20).countSelect();
        return this.success(data);
    }


};
