import { xlsToJSDate } from "../utilities.js"
const CALENDARTYPES = {CA_Base: 'Global', CA_Rsrc: 'Resource', CA_Project: 'Project'}
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const REGEXWEEKDAYS = /(?<=0\|\|[1-7]\(\)).+?(?=(\(0\|\|([1-7]\(\)|VIEW|Exceptions)))/g
const REGEXSHIFT = /([sf]\|[01]\d:[0-5]\d\|*){2}/g;
const REGEXHOUR = /[01]\d:[0-5]\d/g;
const REGEXHOL = /(?<=d\|)\d{5}(?=\)\(\))/g
const REEXCEPT = /(?<=d\|)\d{5}\)\([^\)]{1}.+?\(\)\)\)/g

const reMatchArr = (str, regEx, func=x=>x) => Array.from(str.matchAll(regEx), m => func(m[0]))

const parseWorkShifts = data => reMatchArr(data, REGEXSHIFT).reduce((arr, s) => {
    arr.push(reMatchArr(s, REGEXHOUR))
    return arr
}, [])

const newWorkDay = (dayName, shifts) => {
    return {
        day: dayName,
        shifts: shifts,
        hours: shifts.reduce((a, s) => {
            let h = parseInt(s[1].slice(0,2)) - parseInt(s[0].slice(0,2));
            let m = parseInt(String(s[1]).slice(-2)) / 60 - parseInt(String(s[0]).slice(-2)) / 60
            return a + h + m;
        }, 0),
        start: shifts.length ? shifts[0][0] : "",
        end: shifts.length ? shifts[shifts.length - 1][1] : ""
    }
}

const newExceptionDay = (date, shifts) => {
    let workDay = newWorkDay(WEEKDAYS[date.getDay()], shifts)
    workDay.date = date
    return workDay
}

const parseWorkWeek = ({clndr_data}) => Array.from(
    clndr_data.matchAll(REGEXWEEKDAYS), 
    (m, i) => newWorkDay(WEEKDAYS[i], parseWorkShifts(m[0]))
)

const parseHolidays = ({clndr_data}) => reMatchArr(clndr_data, REGEXHOL, xlsToJSDate).reduce((day, hol) => {
    day[hol.getTime()] = hol
    return day
}, {})

const parseExceptions = ({clndr_data}) => reMatchArr(clndr_data, REEXCEPT).reduce((day, exc) => {
    const dt = xlsToJSDate(exc.slice(0, 5))
    day[dt.getTime()] = newExceptionDay(dt, parseWorkShifts(exc))
    return day
}, {})

export default class Calendar {
    constructor(obj) {
        Object.assign(this, obj)
        this.assignments = 0;
        this.week = parseWorkWeek(this);
        this.holidays = parseHolidays(this);
        this.exceptions = parseExceptions(this);
    }
    get default() {return this.default_flag === 'Y'}
    get id() {return (this.clndr_type === 'CA_Project') ? this.clndr_name : this.clndr_id}
    get type() {return CALENDARTYPES[this.clndr_type]}
    isWorkDay(date) {
        return (
            (this.week[date.getDay()].hours > 0 &&
            !(date.getTime() in this.holidays)) ||
            (date.getTime() in this.exceptions)
        )
    }
    print() {
        console.log(`${this.clndr_name}`);
    }
}

Calendar.prototype.toString = function() {
    return `${this.clndr_name}`
}
