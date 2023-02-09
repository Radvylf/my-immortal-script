var string_to_inputs = (string) => [...string].map(c => BigInt(c.codePointAt(0)));
var outputs_to_string = (outputs) => outputs.map(o => String.fromCodePoint(o)).join("");

var mortal_script = (script, inputs, stop_limit = Infinity, right_limit = Infinity) => {
    var kill = !1;
    
    var config = {
        kill: () => (kill = !0),
        onoutput: null,
        onfinish: null
    };
    
    (async () => {
        await new Promise((r) => setTimeout(r, 0));
        
        script = [...script];
        inputs = [...inputs];
        stop_limit = Number(stop_limit);
        right_limit = Number(right_limit);

        var data = [0n];
        var dp = 0n;
        var sp = null;
        var flip = false;
        var n_flip = false;
        var outputs = [];

        var ip, i, d;

        var stop = 0n;

        for (ip = 0; ip < script.length; ip++) {
            console.log(script[ip], dp, data);

            if (stop++ >= stop_limit) {
                // console.error("STOP (limit = " + stop + "): " + JSON.stringify(script));

                if (config.onfinish)
                    config.onfinish(outputs);
                
                return;
            }

            n_flip = false;

            switch (script[ip]) {
                case "+":
                    if (dp != -1n)
                        data[dp]++;

                    break;
                case "-":
                    if (dp != -1n)
                        data[dp]--;

                    break;
                case "{":
                    dp--;

                    if (dp == -2n)
                        dp = -1n;

                    if (dp == data.length - 2 && data[dp + 1n] == 0n)
                        data.pop();

                    break;
                case "}":
                    if (dp + 1n < right_limit)
                        dp++;

                    while (dp >= data.length)
                        data.push(0n);

                    break;
                case "*":
                    if (dp == -1n)
                        dp = 0n;
                    else
                        dp = data[dp] < right_limit ? data[dp] : right_limit - 1;

                    if (dp < -1n)
                        dp = -1n;

                    while (dp >= data.length)
                        data.push(0n);
                    while (data[data.length - 1] == 0n && dp < data.length - 1)
                        data.pop();

                    break;
                case "_":
                    if (dp != -1n)
                        data[dp] = dp;

                    break;
                case ".":
                    if (dp == -1n || data[dp] >= 0n) {
                        outputs.push(dp != -1n ? data[dp] : 0n);
                        
                        if (config.onoutput)
                            config.onoutput(dp != -1n ? data[dp] : 0n);
                    }

                    break;
                case ",":
                    d = inputs.length ? inputs.shift() : -1n;

                    if (dp != -1n)
                        data[dp] = d;

                    break;
                case ":":
                    if (dp == right_limit - 1)
                        break;

                    if (dp == data.length - 1 && dp != -1n && data[dp] != 0n)
                        data.push(0n);

                    if (dp != -1n && data[dp] != 0n)
                        data[dp + 1n] += data[dp];

                    break;
                case "\\":
                    data[dp] = 0n;

                    break;
                case "0":
                    if (dp != -1n)
                        data[dp] *= 2n;

                    break;
                case "1":
                    if (dp != -1n)
                        data[dp] = data[dp] * 2n + 1n;

                    break;
                case "%":
                    if (dp != -1n && data[dp] % 2n != 0n) {
                        if (dp == data.length - 1)
                            data.push(data[dp] % 2n);
                        else
                            data[dp + 1n] += data[dp] % 2n;
                    }

                    if (dp != -1n)
                        data[dp] /= 2n;

                    break;
                case "?":
                    if ((dp == -1n || data[dp] == 0n) != flip) {
                        if (ip != script.length - 1 && script[ip + 1] == "(") {
                            d = 1;
                            ip += 2;

                            while (d != 0 && ip < script.length) {
                                if (script[ip] == "(")
                                    d++;
                                if (script[ip] == ")")
                                    d--;

                                ip++;
                            }

                            ip--;
                        } else if (ip != script.length - 1 && script[ip + 1] == ")") {
                            d = 1;

                            while (d != 0 && ip >= 0n) {
                                if (script[ip] == "(")
                                    d--;
                                if (script[ip] == ")")
                                    d++;

                                ip--;
                            }
                        } else {
                            ip++;
                        }
                    } else {
                        n_flip = true;
                    }

                    break;
                case "(":
                    break;
                case ")":
                    break;
                case "$":
                    if (dp != -1n) {
                        d = (dp != -1n ? data[dp] : 0n) - (dp < data.length - 1 && dp < right_limit - 1 ? data[dp + 1n] : 0n);
                        data[dp] = d < 0n ? -1n : d == 0n ? 0n : 1n;
                    }

                    break;
                case "'":
                    ip++;

                    if (dp != -1n)
                        data[dp] = ip == script.length ? -1n : BigInt(script[ip].codePointAt(0));

                    break;
                case "\"":
                    while (ip < script.length) {
                        ip++;

                        if (script[ip] == "\"")
                            break;

                        if (dp != -1n)
                            data[dp] = ip < script.length ? BigInt(script[ip].codePointAt(0)) : -1n;

                        if (dp < right_limit - 1)
                            dp++;
                    }

                    while (dp >= data.length)
                        data.push(0n);

                    break;
                case "🦄":
                    if (sp == null)
                        sp = dp;

                    [dp, sp] = [sp, dp];

                    while (dp >= data.length)
                        data.push(0n);
                    while (data[data.length - 1] == 0n && dp < data.length - 1)
                        data.pop();

                    break;
                case "❔":
                    console.log(ip, script, dp, data[dp], data);

                    break;
            }

            flip = n_flip;
            
            if (stop % 100n == 0n) {
                await new Promise((r) => setTimeout(r, 0));
                
                if (kill) {
                    if (config.onfinish)
                        config.onfinish(outputs);
                    
                    return;
                }
            }
        }

        console.log(script[ip], dp, data);
        
        if (config.onfinish)
            config.onfinish(outputs);
    })();
    
    return config;
};