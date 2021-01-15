"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoExtendMavenRange = exports.EXCLUDING_POINT = exports.INCLUDING_POINT = exports.rangeToStr = exports.parseRange = exports.isValid = exports.isSingleVersion = exports.isVersion = exports.compare = exports.isSubversion = exports.tokenize = exports.TYPE_QUALIFIER = exports.TYPE_NUMBER = exports.PREFIX_HYPHEN = exports.PREFIX_DOT = exports.qualifierType = exports.QualifierTypes = void 0;
const PREFIX_DOT = 'PREFIX_DOT';
exports.PREFIX_DOT = PREFIX_DOT;
const PREFIX_HYPHEN = 'PREFIX_HYPHEN';
exports.PREFIX_HYPHEN = PREFIX_HYPHEN;
const TYPE_NUMBER = 'TYPE_NUMBER';
exports.TYPE_NUMBER = TYPE_NUMBER;
const TYPE_QUALIFIER = 'TYPE_QUALIFIER';
exports.TYPE_QUALIFIER = TYPE_QUALIFIER;
function iterateChars(str, cb) {
    let prev = null;
    let next = null;
    for (let i = 0; i < str.length; i += 1) {
        next = str.charAt(i);
        cb(prev, next);
        prev = next;
    }
    cb(prev, null);
}
function isDigit(char) {
    return /^\d$/.test(char);
}
function isLetter(char) {
    return /^[a-z]$/i.test(char);
}
function isTransition(prevChar, nextChar) {
    return ((isDigit(prevChar) && isLetter(nextChar)) ||
        (isLetter(prevChar) && isDigit(nextChar)));
}
function iterateTokens(versionStr, cb) {
    let currentPrefix = PREFIX_HYPHEN;
    let currentVal = '';
    function yieldToken(transition = false) {
        const val = currentVal || '0';
        if (/^\d+$/.test(val)) {
            cb({
                prefix: currentPrefix,
                type: TYPE_NUMBER,
                val: parseInt(val, 10),
                isTransition: transition,
            });
        }
        else {
            cb({
                prefix: currentPrefix,
                type: TYPE_QUALIFIER,
                val,
                isTransition: transition,
            });
        }
    }
    iterateChars(versionStr, (prevChar, nextChar) => {
        if (nextChar === null) {
            yieldToken();
        }
        else if (nextChar === '-') {
            yieldToken();
            currentPrefix = PREFIX_HYPHEN;
            currentVal = '';
        }
        else if (nextChar === '.') {
            yieldToken();
            currentPrefix = PREFIX_DOT;
            currentVal = '';
        }
        else if (prevChar !== null && isTransition(prevChar, nextChar)) {
            yieldToken(true);
            currentPrefix = PREFIX_HYPHEN;
            currentVal = nextChar;
        }
        else {
            currentVal = currentVal.concat(nextChar);
        }
    });
}
function isNull(token) {
    const val = token.val;
    return (val === 0 ||
        val === '' ||
        val === 'final' ||
        val === 'ga' ||
        val === 'release' ||
        val === 'latest' ||
        val === 'sr');
}
const zeroToken = {
    prefix: PREFIX_HYPHEN,
    type: TYPE_NUMBER,
    val: 0,
    isTransition: false,
};
function tokenize(versionStr, preserveMinorZeroes = false) {
    let buf = [];
    let result = [];
    let leadingZero = true;
    iterateTokens(versionStr.toLowerCase().replace(/^v/i, ''), (token) => {
        if (token.prefix === PREFIX_HYPHEN) {
            buf = [];
        }
        buf.push(token);
        if (!isNull(token)) {
            leadingZero = false;
            result = result.concat(buf);
            buf = [];
        }
        else if (leadingZero || preserveMinorZeroes) {
            result = result.concat(buf);
            buf = [];
        }
    });
    return result.length ? result : [zeroToken];
}
exports.tokenize = tokenize;
function nullFor(token) {
    return token.prefix === PREFIX_DOT
        ? {
            prefix: token.prefix,
            type: TYPE_NUMBER,
            val: 0,
        }
        : {
            prefix: token.prefix,
            type: TYPE_QUALIFIER,
            val: '',
        };
}
function commonOrder(token) {
    if (token.prefix === PREFIX_DOT && token.type === TYPE_QUALIFIER) {
        return 0;
    }
    if (token.prefix === PREFIX_HYPHEN && token.type === TYPE_QUALIFIER) {
        return 1;
    }
    if (token.prefix === PREFIX_HYPHEN && token.type === TYPE_NUMBER) {
        return 2;
    }
    return 3;
}
var QualifierTypes;
(function (QualifierTypes) {
    QualifierTypes[QualifierTypes["Alpha"] = 1] = "Alpha";
    QualifierTypes[QualifierTypes["Beta"] = 2] = "Beta";
    QualifierTypes[QualifierTypes["Milestone"] = 3] = "Milestone";
    QualifierTypes[QualifierTypes["RC"] = 4] = "RC";
    QualifierTypes[QualifierTypes["Snapshot"] = 5] = "Snapshot";
    QualifierTypes[QualifierTypes["Release"] = 6] = "Release";
    QualifierTypes[QualifierTypes["SP"] = 7] = "SP";
})(QualifierTypes = exports.QualifierTypes || (exports.QualifierTypes = {}));
function qualifierType(token) {
    const val = token.val;
    if (val === 'alpha' || (token.isTransition && val === 'a')) {
        return QualifierTypes.Alpha;
    }
    if (val === 'beta' || (token.isTransition && val === 'b')) {
        return QualifierTypes.Beta;
    }
    if (val === 'milestone' || (token.isTransition && val === 'm')) {
        return QualifierTypes.Milestone;
    }
    if (val === 'rc' || val === 'cr') {
        return QualifierTypes.RC;
    }
    if (val === 'snapshot' || val === 'snap') {
        return QualifierTypes.Snapshot;
    }
    if (val === '' ||
        val === 'final' ||
        val === 'ga' ||
        val === 'release' ||
        val === 'latest' ||
        val === 'sr') {
        return QualifierTypes.Release;
    }
    if (val === 'sp') {
        return QualifierTypes.SP;
    }
    return null;
}
exports.qualifierType = qualifierType;
function qualifierCmp(left, right) {
    const leftOrder = qualifierType(left);
    const rightOrder = qualifierType(right);
    if (leftOrder && rightOrder) {
        if (leftOrder < rightOrder) {
            return -1;
        }
        if (leftOrder > rightOrder) {
            return 1;
        }
        return 0;
    }
    if (leftOrder && leftOrder < QualifierTypes.Release) {
        return -1;
    }
    if (rightOrder && rightOrder < QualifierTypes.Release) {
        return 1;
    }
    if (left.val < right.val) {
        return -1;
    }
    if (left.val > right.val) {
        return 1;
    }
    return 0;
}
function tokenCmp(left, right) {
    const leftOrder = commonOrder(left);
    const rightOrder = commonOrder(right);
    if (leftOrder < rightOrder) {
        return -1;
    }
    if (leftOrder > rightOrder) {
        return 1;
    }
    if (left.type === TYPE_NUMBER && right.type === TYPE_NUMBER) {
        if (left.val < right.val) {
            return -1;
        }
        if (left.val > right.val) {
            return 1;
        }
        return 0;
    }
    return qualifierCmp(left, right);
}
function compare(left, right) {
    const leftTokens = tokenize(left);
    const rightTokens = tokenize(right);
    const length = Math.max(leftTokens.length, rightTokens.length);
    for (let idx = 0; idx < length; idx += 1) {
        const leftToken = leftTokens[idx] || nullFor(rightTokens[idx]);
        const rightToken = rightTokens[idx] || nullFor(leftTokens[idx]);
        const cmpResult = tokenCmp(leftToken, rightToken);
        if (cmpResult !== 0) {
            return cmpResult;
        }
    }
    return 0;
}
exports.compare = compare;
function isVersion(version) {
    if (!version) {
        return false;
    }
    if (!/^[a-z0-9.-]+$/i.test(version)) {
        return false;
    }
    if (/^[.-]/.test(version)) {
        return false;
    }
    if (/[.-]$/.test(version)) {
        return false;
    }
    if (['latest', 'release'].includes(version.toLowerCase())) {
        return false;
    }
    const tokens = tokenize(version);
    return !!tokens.length;
}
exports.isVersion = isVersion;
exports.isSingleVersion = isVersion;
const INCLUDING_POINT = 'INCLUDING_POINT';
exports.INCLUDING_POINT = INCLUDING_POINT;
const EXCLUDING_POINT = 'EXCLUDING_POINT';
exports.EXCLUDING_POINT = EXCLUDING_POINT;
function parseRange(rangeStr) {
    function emptyInterval() {
        return {
            leftType: null,
            leftValue: null,
            leftBracket: null,
            rightType: null,
            rightValue: null,
            rightBracket: null,
        };
    }
    const commaSplit = rangeStr.split(',');
    let result = [];
    let interval = emptyInterval();
    commaSplit.forEach((subStr) => {
        if (!result) {
            return;
        }
        if (interval.leftType === null) {
            if (/^\[.*]$/.test(subStr)) {
                const ver = subStr.slice(1, -1);
                result.push({
                    leftType: INCLUDING_POINT,
                    leftValue: ver,
                    leftBracket: '[',
                    rightType: INCLUDING_POINT,
                    rightValue: ver,
                    rightBracket: ']',
                });
                interval = emptyInterval();
            }
            else if (subStr.startsWith('[')) {
                const ver = subStr.slice(1);
                interval.leftType = INCLUDING_POINT;
                interval.leftValue = ver;
                interval.leftBracket = '[';
            }
            else if (subStr.startsWith('(') || subStr.startsWith(']')) {
                const ver = subStr.slice(1);
                interval.leftType = EXCLUDING_POINT;
                interval.leftValue = ver;
                interval.leftBracket = subStr[0];
            }
            else {
                result = null;
            }
        }
        else if (subStr.endsWith(']')) {
            const ver = subStr.slice(0, -1);
            interval.rightType = INCLUDING_POINT;
            interval.rightValue = ver;
            interval.rightBracket = ']';
            result.push(interval);
            interval = emptyInterval();
        }
        else if (subStr.endsWith(')') || subStr.endsWith('[')) {
            const ver = subStr.slice(0, -1);
            interval.rightType = EXCLUDING_POINT;
            interval.rightValue = ver;
            interval.rightBracket = subStr.endsWith(')') ? ')' : '[';
            result.push(interval);
            interval = emptyInterval();
        }
        else {
            result = null;
        }
    });
    if (interval.leftType) {
        return null;
    } // something like '[1,2],[3'
    if (!result || !result.length) {
        return null;
    }
    const lastIdx = result.length - 1;
    let prevValue = null;
    return result.reduce((acc, range, idx) => {
        const { leftType, leftValue, rightType, rightValue } = range;
        if (idx === 0 && leftValue === '') {
            if (leftType === EXCLUDING_POINT && isVersion(rightValue)) {
                prevValue = rightValue;
                return [...acc, { ...range, leftValue: null }];
            }
            return null;
        }
        if (idx === lastIdx && rightValue === '') {
            if (rightType === EXCLUDING_POINT && isVersion(leftValue)) {
                if (prevValue && compare(prevValue, leftValue) === 1) {
                    return null;
                }
                return [...acc, { ...range, rightValue: null }];
            }
            return null;
        }
        if (isVersion(leftValue) && isVersion(rightValue)) {
            if (compare(leftValue, rightValue) === 1) {
                return null;
            }
            if (prevValue && compare(prevValue, leftValue) === 1) {
                return null;
            }
            prevValue = rightValue;
            return [...acc, range];
        }
        return null;
    }, []);
}
exports.parseRange = parseRange;
function isValid(str) {
    if (!str) {
        return false;
    }
    return isVersion(str) || !!parseRange(str);
}
exports.isValid = isValid;
function rangeToStr(fullRange) {
    if (fullRange === null) {
        return null;
    }
    const valToStr = (val) => (val === null ? '' : val);
    if (fullRange.length === 1) {
        const { leftBracket, rightBracket, leftValue, rightValue } = fullRange[0];
        if (leftValue === rightValue &&
            leftBracket === '[' &&
            rightBracket === ']') {
            return `[${valToStr(leftValue)}]`;
        }
    }
    const intervals = fullRange.map((val) => [
        val.leftBracket,
        valToStr(val.leftValue),
        ',',
        valToStr(val.rightValue),
        val.rightBracket,
    ].join(''));
    return intervals.join(',');
}
exports.rangeToStr = rangeToStr;
function tokensToStr(tokens) {
    return tokens.reduce((result, token, idx) => {
        const prefix = token.prefix === PREFIX_DOT ? '.' : '-';
        return `${result}${idx !== 0 && token.val !== '' ? prefix : ''}${token.val}`;
    }, '');
}
function coerceRangeValue(prev, next) {
    const prevTokens = tokenize(prev, true);
    const nextTokens = tokenize(next, true);
    const resultTokens = nextTokens.slice(0, prevTokens.length);
    const align = Math.max(0, prevTokens.length - nextTokens.length);
    if (align > 0) {
        resultTokens.push(...prevTokens.slice(prevTokens.length - align));
    }
    return tokensToStr(resultTokens);
}
function incrementRangeValue(value) {
    const tokens = tokenize(value);
    const lastToken = tokens[tokens.length - 1];
    if (typeof lastToken.val === 'number') {
        lastToken.val += 1;
        return coerceRangeValue(value, tokensToStr(tokens));
    }
    return value;
}
function autoExtendMavenRange(currentRepresentation, newValue) {
    const range = parseRange(currentRepresentation);
    if (!range) {
        return currentRepresentation;
    }
    const isPoint = (vals) => {
        if (vals.length !== 1) {
            return false;
        }
        const { leftType, leftValue, rightType, rightValue } = vals[0];
        return (leftType === 'INCLUDING_POINT' &&
            leftType === rightType &&
            leftValue === rightValue);
    };
    if (isPoint(range)) {
        return `[${newValue}]`;
    }
    let nearestIntervalIdx = 0;
    const len = range.length;
    for (let idx = len - 1; idx >= 0; idx = -1) {
        const { leftValue, rightValue } = range[idx];
        if (rightValue === null) {
            nearestIntervalIdx = idx;
            break;
        }
        if (compare(rightValue, newValue) === -1) {
            nearestIntervalIdx = idx;
            break;
        }
        if (leftValue && compare(leftValue, newValue) !== 1) {
            return currentRepresentation;
        }
    }
    const interval = range[nearestIntervalIdx];
    const { leftValue, rightValue } = interval;
    if (leftValue !== null &&
        rightValue !== null &&
        incrementRangeValue(leftValue) === rightValue) {
        if (compare(newValue, leftValue) !== -1) {
            interval.leftValue = coerceRangeValue(leftValue, newValue);
            interval.rightValue = incrementRangeValue(interval.leftValue);
        }
    }
    else if (rightValue !== null) {
        if (interval.rightType === INCLUDING_POINT) {
            const tokens = tokenize(rightValue);
            const lastToken = tokens[tokens.length - 1];
            if (typeof lastToken.val === 'number') {
                interval.rightValue = coerceRangeValue(rightValue, newValue);
            }
            else {
                interval.rightValue = newValue;
            }
        }
        else {
            interval.rightValue = incrementRangeValue(coerceRangeValue(rightValue, newValue));
        }
    }
    else if (leftValue !== null) {
        interval.leftValue = coerceRangeValue(leftValue, newValue);
    }
    if (interval.leftValue && interval.rightValue) {
        const correctRepresentation = compare(interval.leftValue, interval.rightValue) !== 1
            ? rangeToStr(range)
            : null;
        return correctRepresentation || currentRepresentation;
    }
    return rangeToStr(range);
}
exports.autoExtendMavenRange = autoExtendMavenRange;
function isSubversion(majorVersion, minorVersion) {
    const majorTokens = tokenize(majorVersion);
    const minorTokens = tokenize(minorVersion);
    let result = true;
    const len = majorTokens.length;
    for (let idx = 0; idx < len; idx += 1) {
        const major = majorTokens[idx];
        const minor = minorTokens[idx] || nullFor(majorTokens[idx]);
        const cmpResult = tokenCmp(major, minor);
        if (cmpResult !== 0) {
            result = false;
            break;
        }
    }
    return result;
}
exports.isSubversion = isSubversion;
//# sourceMappingURL=compare.js.map