const regexOperations = {
    ALTERNATION : '|',
    STAR : '*'
};
const outputStringsList = document.getElementById('stringOutput');
let genRe = undefined;

function transformInputToPattern() {
    let regexString = document.getElementById("regexInput").value.split('');
    let startPattern = regexString.map(el => {return isAction(el) ? [{action: el}] : [{val : el}]})
        .reduce((acc, el) => {
            if(el[0].action === regexOperations.STAR){
                acc[acc.length -1].action = regexOperations.STAR;
                return acc;
            } else
            {
                return  acc.concat(el);
            }
        });
    genRe = runner(startPattern);
    invokeStringGeneration(100);
}

function isAction(currentChar) {
    return (currentChar === regexOperations.ALTERNATION || currentChar === regexOperations.STAR);
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

function invokeStringGeneration(amount) {
    generateStringsByCurrentPattern(amount,genRe);
}

function generateStringsByCurrentPattern(n, generator) {
    let matches = '';
    while (n>0){
        let currentValue = generator.next().value;
        if (currentValue !== undefined) {
            addToListOfStringsOutput(currentValue);
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

function addToListOfStringsOutput(currentValue) {
    let listViewItem = document.createElement('li');
    listViewItem.appendChild(document.createTextNode(currentValue));
    outputStringsList.appendChild(listViewItem);
}

function transformPatternToStack(pattern) {
        let stack = [[]];
        pattern.forEach(function(element) {
            element.action === regexOperations.ALTERNATION ? stack.push([]) : stack[stack.length - 1].push(element);
        });
        return stack;
}

function processStack(stack) {
    const currentPattern = stack.shift();
    return {value: stripRegex(currentPattern), stack: stack.length ? stack.concat(splitRegexByStarAction(currentPattern)) : splitRegexByStarAction(currentPattern)};
}

function stripRegex(currentPattern) {
    return currentPattern.map(el => el.action === regexOperations.STAR ? el.val.substring(1) : el.val).join('');
}

function splitRegexByStarAction(currentPattern) {
    let actionIndexes = [];
    for(let i=0; i<currentPattern.length; i++){
        currentPattern[i].action === regexOperations.STAR ? actionIndexes.push(i) : undefined; //check if can use reducer to shorten the syntax
    }
    // const actionIndexes = currentPattern.filter(el => !!el.action).map((_, index) => index);
    let stack = [];
    // actionIndexes.reduce((_, el) => stack.concat(processStarPattern(currentPattern,el)));
    actionIndexes.forEach(index => {
        stack.push(processStarPattern(currentPattern,index));
    });
    return stack;
}

function processStarPattern(currentPattern, actionIndex) {
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
*  add empty string support
*  try to make no mutations and reduce created objects - only functions
*  refactor splitRegexByStarAction + processStarPattern to support | and * together ??
*  try to make splitRegexByStarAction + processStarPattern more work more functional
*  refactor code for review
*  add comments to code
*  give interesting test cases
*  explain how it was built - flattened tree which is transformed into a stack (array of arrays of objects)
*  go through the previous exercise (10 power of 10)
*  DONE - need to handle * case. create array of pattern from regex - use library or try myself
*  DONE - give meaningful names
*  DONE - add reset option + run again + if input is changed then reset as well
*  DONE -  fix | operator for multiple |
*  DONE - make * work with case zero(shouldn't print them at first)
*  DONE - add | operator support (process the regex before the generator and initialize the stack with right amount of sub arrays
*  DONE - add "generateStringsByCurrentPattern" generator that give support of taking first n strings - from the internet
*  DONE - give an interface to check the functionality
*/

