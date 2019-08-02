const regexOperations = {
    ALTERNATION : '|',
    STAR : '*'
};
const pattern =  [{val : '1', action: regexOperations.STAR}, {action: regexOperations.ALTERNATION}, {val : '2'}, {action: regexOperations.ALTERNATION}, {val : '3'},{val : '4'},{val : '5'}];
let genRe = runner(pattern);

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
    let actionIndexes = [];
    for(let i=0; i<pattern.length; i++){
        pattern[i].action === regexOperations.ALTERNATION ? actionIndexes.push(i) : undefined; //check if can use reducer to shorten the syntax
    }
    // const actionIndexes = currentPattern.filter(el => !!el.action).map((_, index) => index);
    // actionIndexes.reduce((_, el) => stack.concat(processPattern(currentPattern,el)));
    if(actionIndexes.length >0 ) {
        let stack = [];
        actionIndexes.forEach(actionIndex => {
            let patternPrefix = pattern.slice(0, actionIndex);
            let patternPostfix = pattern.slice(actionIndex + 1);
            stack.push(patternPrefix);
            stack.push(patternPostfix);
        });
        return stack;
    }
    return  [pattern];
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
*  create array of pattern from regex - use library or try myself
*  DONE - make * work with case zero(shouldn't print them at first)
*  refactor splitRegex + processPattern to support | and * together
*  try to make splitRegex + processPattern more work more functional
*  give meaningful names
*  fix | operator for multiple |
*  Done - add | operator support (process the regex before the generator and initialize the stack with right amount of sub arrays
*  add empty string support
*  DONE - add "take" generator that give support of taking first n strings - from the internet
*  give an interface to check the functionality
*  give interesting test cases
*  explain how it was built - flattened tree which is transformed into a stack (array of arrays of objects)
*  try to make no mutations and reduce created objects - only functions
*  go through the previous exercise (10 power of 10)
*  add comments to code*/

