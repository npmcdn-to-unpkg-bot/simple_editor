export default class commonSvc {
    constructor($injector){
        this.$http = $injector.get('$http');
        this.$httpParamSerializerJQLike = $injector.get('$httpParamSerializerJQLike');
    }

    get(url,params){
        return this.$http({
            url : url,
            method : "GET",
            params : params
        });
    }

    post(url,params){
        return this.$http({
            url : url,
            method : "POST",
            data : this.$httpParamSerializerJQLike(params)
        });
    }

    put(url, params){
        return this.$http({
            url : url,
            method : "PUT",
            data : this.$httpParamSerializerJQLike(params),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache : false
        });
    }

    delete(url, params){
        return this.$http({
            url : url,
            method : "DELETE",
            params : params,
            cache : false
        });
    }
};

