MathJax = {
    loader: {load: ['input/asciimath', 'output/chtml']}
}
const input = document.createElement("textarea");
input.style.position = "absolute";
input.style.left = "-100%";
document.body.appendChild(input);
addEventListener("click", () => input.focus());
input.focus();
const fix = () => input.style.left = "0";
fix();
let ITERATIONS = 10000;
const numberFix = n => Math.round(n * 10000000) / 10000000;
const newton = (f, df, x0, iterations) => {
    for (let i = 0; i < iterations; i++) {
        let z = df(x0);
        x0 -= f(x0) / (z || 0.000000001);
    }
    return x0;
};
const solve = equation => {
    const f = eval(`x =>` + equation.map(i => `${i[0]}*` + (i[1] ? `(x**${i[1]})` : "1")).join("+"));
    const df = eval(`x =>` + equation.map(i => `${i[0]}*${i[1]}*` + (i[1] ? `(x**${i[1] - 1})` : "0")).join("+"));
    return numberFix(newton(f, df, 0, ITERATIONS));
};
/*
const newton = (f, df, x0, iterations) => {
    for (let i = 0; i < iterations; i++) x0 = x0.subtract(f(x0).divide(df(x0)));
    return x0;
};
const solve = equation => {
    const f = x => {
        let result = new BigNumber;
        equation.forEach(i => {
            let a = x;
            if (i[1]) a = a.pow(i[1]);
            result = result.add(a.multiply(i[0]));
        });
        return result;
    };
    const df = x => {
        let result = new BigNumber;
        equation.forEach(i => {
            if(!i[1]) return;
            let a = x;
            if (i[1] - 1) a = a.pow(i[1] - 1);
            result = result.add(a.multiply(i[0] * i[1]));
        });
        return result;
    };
    return numberFix(newton(f, df, new BigNumber("0"), ITERATIONS));
};*/
const allowed = `x0123456789^()[]e+-*/ pie`;
addEventListener("load", () => {
    let b = " ";
    input.value = "x + 1";
    setInterval(() => {
        if (input.value.startsWith("(")) input.value = input.value.substring(1);
        input.value = input.value.substring(0, 75)
            .split("").filter(i => allowed.includes(i)).join("")
            .replaceAll("  ", " ");
        if (b === input.value) return;
        b = input.value;
        document.querySelector(".equation").innerText = "`" + input.value + " = 0`";
        MathJax["typeset"]([document.querySelector(".equation")]);
    }, 10);
});
document.querySelector(".solve").addEventListener("click", () => {
    if (!input.value.includes("x")) return alert("This equation doesn't have an 'x'.");
    if (!/^-?((\d+|\d*x)(\^([\d+\-*/e]|pi))*[+\-*/]?)+$/.test(input.value.replaceAll(" ", "").replaceAll("(", "").replaceAll(")", ""))) return alert("Equation should have exponential x variables on left. Examples:\nx^2 + 2x = -1\nx^5 + x^4 + x^3 + x^2 + x + 1 = 3\nx + 1 = 0");
    if (input.value.split("=").some(i => i.split("").filter(j => j === "(").length !== i.split("").filter(j => j === ")").length)) return alert("Missing parenthesis.");
    try {
        eval(
            input.value.replaceAll("x", "1")
                .replaceAll(" ", "")
                .replaceAll("^", "**")
        );
    } catch (e) {
        alert("Syntax error.");
        return console.error(e);
    }
    let par = 0;
    let p = [""];
    for (let i = 0; i < input.value.length; i++) {
        const c = input.value[i];
        if (c === " ") continue;
        if (c === "(") par++;
        if (c === ")") par--;
        if (!par && `+-`.includes(c) && i !== 0) {
            p.push(c === "-" ? c : "");
            continue;
        }
        p[p.length - 1] += c;
    }
    const eq = p.map(i => {
        const t = n => {
            n = eval(n);
            if (n === undefined) return 1;
            return n;
        };
        if (i.includes("x")) {
            return [t(i.split("x")[0]), t(i.split("x^")[1])]
        } else return [t(i), 0];
    });
    document.querySelector(".solutions").innerHTML = `<div>\`x = ${solve(eq)}\`</div>`;
    MathJax["typeset"]([document.querySelector(".solutions > div")]);
});