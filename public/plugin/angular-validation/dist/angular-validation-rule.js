(function () {
  angular
    .module('validation.rule', ['validation'])
    .config(['$validationProvider', function ($validationProvider) {
      var expression = {
        required: function (value) {
          return !!value;
        },
        url: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
        email: /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
        number: /^\d+$/,
        plate: /^[\u4E00-\u9FA5][\da-zA-Z]{6}$/,
        date: /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/,
        minlength: function (value, scope, element, attrs, param) {
          return value.length >= param;
        },
        maxlength: function (value, scope, element, attrs, param) {
          return value.length <= param;
        },
        nonNegative: /^\\d+(\\.\\d+)?$/,
        identity: function (value) {
          if (!value) {
            return true;
          }
          if (!/^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/.test(value)) {
            return false;
          }
          if (value.length == 18) {
            var idCardWi = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2); //将前17位加权因子保存在数组里
            var idCardY = new Array(1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2); //这是除以11后，可能产生的11位余数、验证码，也保存成数组
            var idCardWiSum = 0; //用来保存前17位各自乖以加权因子后的总和
            for (var i = 0; i < 17; i++) {
              idCardWiSum += value.substring(i, i + 1) * idCardWi[i];
            }

            var idCardMod = idCardWiSum % 11;//计算出校验码所在数组的位置
            var idCardLast = value.substring(17);//得到最后一位身份证号码

            //如果等于2，则说明校验码是10，身份证号码最后一位应该是X
            if (idCardMod == 2) {
              if (idCardLast == "X" || idCardLast == "x") {
                return true;
              } else {
                return false;
              }
            } else {
              //用计算出的验证码与最后一位身份证号码匹配，如果一致，说明通过，否则是无效的身份证号码
              if (idCardLast == idCardY[idCardMod]) {
                return true;
              } else {
                return false;
              }
            }
          }

        },
        phone: function (value) {
          if (!value) {
            return true;
          }
          if (/^1[3|4|5|7|8]\d{9}$/.test(value)) {
            return true;
          }
          else if (/^0(\d{2,3}\-?)?\d{7,8}$/.test(value)) {
            return true;
          }
          return false;
        },
      };

      var defaultMsg = {
        required: {
          error: '此项不能为空',
        },
        url: {
          error: 'This should be Url',
        },
        email: {
          error: 'This should be Email',
        },
        number: {
          error: '请输入数字',
        },
        minlength: {
          error: '输入少于最小长度',
        },
        maxlength: {
          error: '输入超过最大长度',
        },
        nonNegative: {
          error: '金额格式不正确',
        },
        identity: {
          error: '身份证号格式不正确',
        },
        phone: {
          error: '电话号码格式不正确',
        },
        plate: {
          error: '车牌号码格式不正确',
        },
        date: {
          error: '日期格式应为YYYY-MM-DD,如1981-03-26'   
        }
      };
      $validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);
      $validationProvider.setValidMethod('blur');
    }]);
}).call(this);
