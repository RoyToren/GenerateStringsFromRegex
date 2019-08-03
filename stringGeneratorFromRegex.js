const regexOperations = {
    ALTERNATION : '|',
    STAR : '*'
};

function isAction(currentChar) {
    return (currentChar === regexOperations.ALTERNATION || currentChar === regexOperations.STAR);
}

function transformInputToPattern() {
    let startPattern = [];
    let regexString = document.getElementById("regexInput").value.split('');
    startPattern = regexString.map(el => {return isAction(el) ? [{action: el}] : [{val : el}]})
        .reduce((acc, el) => {
            if(el[0].action === regexOperations.STAR){
                acc[acc.length -1].action = regexOperations.STAR;
                return acc;
            } else
            {
                return  acc.concat(el);
            }
        });
    // actionIndexes.reduce((_, el) => stack.concat(processPattern(currentPattern,el)));

    take(100,runner(startPattern));
}
//const pattern =  [{val : '1', action: regexOperations.STAR},{val : '1'}, {action: regexOperations.ALTERNATION}, {val : '2'}, {action: regexOperations.ALTERNATION}, {val : '3'},{val : '4'},{val : '5'}];
//let genRe = runner(pattern);

function take(n, generator) {
    let matches = '';
    while (n>0){
        let currentValue = generator.next().value;
        if (currentValue !== undefined) {
            matches += currentValue + ',';
            console.log('left to calculate: ' + n);
            n--;
        } else {
            console.log('There are no more string left to calculate');
            break;
        }
    }
    console.log(matches);
}

function transformPatternToStack(pattern) {
        let stack = [[]];
        pattern.forEach(function(element) {
            element.action === regexOperations.ALTERNATION ? stack.push([]) : stack[stack.length - 1].push(element);
        });
        return stack;
}

function* runner(startPattern) {
    let stack = transformPatternToStack(startPattern);
    //let stack = [startPattern];
    while (true) {
        if(stack.length){
            const iterationResult = processStack(stack);
            stack = iterationResult.stack;
            yield iterationResult.value;
        } else {
            yield undefined;
        }
    }
}

function processStack(stack) {
    const currentPattern = stack.shift();
    return {value: stripRegex(currentPattern), stack: stack.length ? stack.concat(splitRegex(currentPattern)) : splitRegex(currentPattern)};
}

function stripRegex(currentPattern) {
    return currentPattern.map(el => el.action === regexOperations.STAR ? el.val.substring(1) : el.val).join('');
    //return currentPattern.map(el => el.val).join('');
}

function splitRegex(currentPattern) {
    let actionIndexes = [];
    for(let i=0; i<currentPattern.length; i++){
        currentPattern[i].action === regexOperations.STAR ? actionIndexes.push(i) : undefined; //check if can use reducer to shorten the syntax
    }
    // const actionIndexes = currentPattern.filter(el => !!el.action).map((_, index) => index);
    let stack = [];
    // actionIndexes.reduce((_, el) => stack.concat(processPattern(currentPattern,el)));
    actionIndexes.forEach(index => {
        stack.push(processPattern(currentPattern,index));
    });
    return stack;
}

function processPattern(currentPattern, actionIndex) {
    let patternPrefix = currentPattern.slice(0,actionIndex);
    let currentElement = currentPattern[actionIndex];
    let currentElementChar = currentElement.val.substring(0,1);
    let patternPostfix = currentPattern.slice(actionIndex + 1);
    return patternPrefix.map(el => ({val: el.val}))
        .concat([{val: currentElement.val + currentElementChar, action: currentElement.action}])
        .concat(patternPostfix);
}

/*
* TODO:
*  DONE - need to handle * case. create array of pattern from regex - use library or try myself
*  add empty string support
*  add reset option + run again + if input is changed then reset as well
*  refactor splitRegex + processPattern to support | and * together
*  try to make splitRegex + processPattern more work more functional
*  give meaningful names
*  try to make no mutations and reduce created objects - only functions
*  DONE -  fix | operator for multiple |
*  DONE - make * work with case zero(shouldn't print them at first)
*  DONE - add | operator support (process the regex before the generator and initialize the stack with right amount of sub arrays
*  DONE - add "take" generator that give support of taking first n strings - from the internet
*  DONE - give an interface to check the functionality
*  give interesting test cases
*  explain how it was built - flattened tree which is transformed into a stack (array of arrays of objects)
*  go through the previous exercise (10 power of 10)
*  add comments to code*/

