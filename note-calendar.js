/**
 * A promise that is resolved when the html DOM is ready.
 * Should be part of any browser, but is not.
 *
 * @type {Promise<void>} A promise that is resolved when the html DOM is ready
 */
const readyPromise = new Promise((resolve, reject) => {
    if (
        document.readyState === "complete" ||
        (document.readyState !== "loading" && !document.documentElement.doScroll)
    ) {
        setTimeout(() => resolve(), 1);
    } else {
        const onContentLoaded = () => {
            resolve();
            document.removeEventListener("DOMContentLoaded", onContentLoaded, false);
        };
        document.addEventListener("DOMContentLoaded", onContentLoaded, false);
    }
});

/**
 * Add a new css string to the page
 *
 * @param {string} styleText The CSS string to pass
 * @returns {void}
 */
const addStyle = (() => {
    let styleElement = null;
    let styleContent = null;

    /**
     * Add a new css string to the page
     *
     * @param {string} styleText The CSS string to pass
     * @returns {void}
     */
    return (styleText) => {
        if (styleElement === null) {
            styleElement = document.createElement("style");
            styleContent = "";
            document.head.appendChild(styleElement);
        } else {
            styleContent += "\n";
        }

        styleContent += styleText;
        styleElement.textContent = styleContent;
    };
})();

/**
 * Create an HTMLElement using various properties
 * @param {string} name
 * @param {object} obj
 * @param {HTMLElement} obj.parent
 * @param {string[]} obj.classNames
 * @param {string} obj.text
 * @param {HTMLElement[]} obj.children
 * @param {{[name: string]: string}} obj.properties
 * @param {(element:HTMLElement)=>void} obj.onCreated
 * @returns {HTMLElement}
 */
const createElement = (name, { parent, classNames, text, children, properties, onCreated }) => {
    const element = document.createElement(name);
    if (parent) {
        parent.appendChild(element);
    }
    if (classNames) {
        classNames.forEach((className) => element.classList.add(className));
    }
    if (text) {
        element.textContent = text;
    }
    if (children) {
        children.forEach((child) => { if (child) { element.appendChild(child) } });
    }
    if (onCreated) {
        onCreated(element);
    }
    if (properties) {
        Object.keys(properties).forEach(
            (property) => (element.setAttribute(property, properties[property]))
        );
    }
    return element;
};

const monthsByIndex = {
    1: 'Janvier',
    2: 'Février',
    3: 'Mars',
    4: 'Avril',
    5: 'Mai',
    6: 'Juin',
    7: 'Juillet',
    8: 'Août',
    9: 'Septembre',
    10: 'Octobre',
    11: 'Novembre',
    12: 'Décembre',
}

const weeksDay = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

/**
 * Create a days structure based on a date and a number of weeks before and after
 * @param {Date} date 
 * @param {number} weeksBefore
 * @param {number} weeksAfter
 */
const createDays = (date, weeksBefore, weeksAfter) => {
    const msecByDay = 1000 * 60 * 60 * 24;
    const dateValue = Math.floor(date.getTime() / msecByDay) * msecByDay;
    const day = new Date(dateValue).getUTCDay();
    const start = dateValue + (-day + 1 - 7 * weeksBefore) * msecByDay;
    const stop = dateValue + (-day + 1 + 7 * (weeksAfter + 1)) * msecByDay;

    let currentWeek = null;
    let lastFirstWeekOfMonth = null;
    const result = {
        lastMonth: '',
        monthSpans: {},
        weeks: [],
    };

    for (let currentDateValue = start; currentDateValue < stop; currentDateValue += msecByDay) {
        const currentDate = new Date(currentDateValue);
        const nextDayDate = new Date(currentDateValue + msecByDay);
        const nextWeekDate = new Date(currentDateValue + 7 * msecByDay);
        const date = currentDate.getUTCDate();
        const month = currentDate.getUTCMonth() + 1;
        const day = currentDate.getUTCDay();
        const year = currentDate.getUTCFullYear();
        const nextDayMonth = (currentDateValue + msecByDay < stop) && (day !== 0) && (nextDayDate.getUTCMonth() !== currentDate.getUTCMonth());
        const nextWeekMonth = (currentDateValue + 7 * msecByDay < stop) && (nextWeekDate.getUTCMonth() !== currentDate.getUTCMonth());
        const nextDayYear = (currentDateValue + msecByDay < stop) && (day !== 0) && (nextDayDate.getUTCFullYear() !== currentDate.getUTCFullYear());
        const nextWeekYear = (currentDateValue + 7 * msecByDay < stop) && (nextWeekDate.getUTCFullYear() !== currentDate.getUTCFullYear());
        const isWe = day === 6;
        const isWe2 = day === 0;
        const isDate = dateValue === currentDateValue;
        console.log({ dateValue, currentDateValue, isDate, date, month })
        if (day === 1) {
            currentWeek = {
                month: `${monthsByIndex[month]}\n${year}`,
                days: [],
                nextWeekMonth: true,
                nextWeekYear: (month === 12),
            };
            result.weeks.push(currentWeek);
            result.lastMonth = currentWeek.month;
            if (result.monthSpans[currentWeek.month] === undefined) {
                result.monthSpans[currentWeek.month] = 0;
                currentWeek.isFirstMonth = true;
                lastFirstWeekOfMonth = currentWeek;
            } else {
                currentWeek.isFirstMonth = false;
            }
            result.monthSpans[currentWeek.month] += 1;

        }
        currentWeek.days.push({ date, nextDayMonth, nextWeekMonth, nextDayYear, nextWeekYear, isWe, isWe2, isDate });
    }
    if (lastFirstWeekOfMonth) {
        lastFirstWeekOfMonth.nextWeekMonth = false;
        lastFirstWeekOfMonth.nextWeekYear = false;
    }
    return result;
}

/**
 * Start the main code of the page
 * @returns {Promise<void>}
 */
const start = async () => {
    let mainTable = null;
    addStyle('.day { width: 20px; height:20px; padding: 0; margin: 0; position: relative}');
    addStyle('.header { height:20px; }');
    addStyle('.day, .month, .header { font-family: "Calibri","sans-serif"; text-align:center; vertical-align:middle; box-sizing: border-box; font-size: 0.8em;}');
    addStyle('.month { width: 70px; white-space: pre; }');
    addStyle('.main-table { border: 2px solid #000; }');
    addStyle('.header { border-bottom: 2px solid #000; }');
    addStyle('.header { padding: 0px; }');

    addStyle('body { margin: 0; padding: 0; }');
    addStyle('.workspace { margin: 0; padding: 10px; position: relative; width: 100%; box-sizing: border-box; text-align: right; }');
    addStyle('.main-table { position: relative; right: 0px; top: 0px; border-spacing: 0; }');
    addStyle('.main-table { border: 2px solid #000; }');
    addStyle('.main-table-outer { display: inline-block; position: relative; right: 0px; border-spacing: 0; }')
    addStyle('.header,.month { font-weight: bold; }');
    addStyle('.next-w-month { border-bottom: 1px solid #000; }');
    addStyle('.next-d-month { border-right: 1px solid #000; }');
    addStyle('.next-w-year { border-bottom: 2px solid #000; }');
    addStyle('.next-d-year { border-right: 2px solid #000; }');
    addStyle('.month { border-right: 2px solid #000; }');
    addStyle('.day { background-color: #f0f0ff }')
    addStyle('.we { background-color: #c0c0ff }')
    addStyle('.we2 { background-color: #9090df }');
    addStyle('.today:before { width: 20px; height:20px; border-radius: 15px; content:" "; box-sizing: border-box; display: block; position: absolute; padding: 0; margin: 0; top: 0; border: 2px solid #000; }');

    addStyle('@media print { @page { size: A4; } }')

    const calendatInfo = createDays(new Date(), 3, 44);
    console.log(calendatInfo);

    createElement("div", {
        classNames: ["workspace"],
        parent: document.body,
        children: [
            createElement("div", {
                classNames: ["main-table-outer"],
                children: [
                    createElement("table", {
                        classNames: ["main-table"],
                        children: [
                            createElement("tr", {
                                classNames: ["header-line"],
                                children: [
                                    createElement("th", { classNames: ["header", "month"], text: "Month" }),
                                    ...weeksDay.map((text) => createElement("th", { classNames: ["header"], text })),
                                ]
                            }),
                            ...calendatInfo.weeks.map((weekInfo) => {
                                const classNames = ['month']
                                if (weekInfo.nextWeekMonth) {
                                    classNames.push('next-w-month')
                                }
                                if (weekInfo.nextWeekYear) {
                                    classNames.push('next-w-year')
                                }
                                return createElement("tr", {
                                    classNames: ["line"],
                                    children: [
                                        weekInfo.isFirstMonth ? createElement("td", { classNames, text: weekInfo.month, properties: { rowspan: calendatInfo.monthSpans[weekInfo.month] } }) : null,
                                        ...weekInfo.days.map((dayInfo) => {
                                            const classNames = ['day']
                                            if (dayInfo.nextWeekMonth) {
                                                classNames.push('next-w-month')
                                            }
                                            if (dayInfo.nextWeekYear) {
                                                classNames.push('next-w-year')
                                            }
                                            if (dayInfo.nextDayMonth) {
                                                classNames.push('next-d-month')
                                            }
                                            if (dayInfo.nextDayYear) {
                                                classNames.push('next-d-year')
                                            }
                                            if (dayInfo.isWe) {
                                                classNames.push('we')
                                            }
                                            if (dayInfo.isWe2) {
                                                classNames.push('we2')
                                            }
                                            if (dayInfo.isDate) {
                                                classNames.push('today')
                                            }
                                            return createElement("td", { classNames, text: dayInfo.date })
                                        }),
                                    ]
                                })
                            }),
                        ]
                    }),
                ]
            }),
        ]
    })
};

readyPromise.then(start);
