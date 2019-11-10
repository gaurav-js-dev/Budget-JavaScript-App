var budgetController = (function () {

    var Expense = function (id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else this.percentage = -1;
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };



    var Income = function (id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;

    };



    var calcTotal = function (type) {
        var total = 0;
        data.allItems[type].forEach(el => total += el.value);
        data.totals[type] = total;
    };


    var data = {
        allItems: {
            inc: [],
            exp: []
        },

        totals: {
            exp: 0,
            inc: 0,
        },

        budget: 0,
        percentage: -1,
    };



    return {

        addItem: function (desc, type, value) {
            var id, newItem;

            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                id = 0;
            }

            // create new item or object based on income or expense 
            if (type === "exp") {
                newItem = new Expense(id, desc, value);
            } else if (type === "inc") {
                newItem = new Income(id, desc, value);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function (type, id) {

            // A new array containing of all ids ie [1,2,3,4,5,8,10];
            var ids = data.allItems[type].map(cur => cur.id);

            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            calcTotal("exp");
            calcTotal("inc");

            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(cur => cur.calcPercentage(data.totals.inc));
        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(cur => cur.getPercentage());
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                percentage: data.percentage,
                totalExp: data.totals.exp,
                totalInc: data.totals.inc
            }
        },
        testing: function () {
            console.log(data);
        }
    }

})();

var uiController = (function () {

    var inputDOM = {
        type: ".add__type",
        description: ".add__description",
        value: ".add__value",
        button: ".add__btn",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expenseLabel: ".budget__expenses--value",
        totalPercent: ".budget__expenses--percentage",
        dateMonth: ".budget__title--month",
        itemsPercent: ".item__percentage"
    };


    var formatNumber = function (num, type) {
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split(".");

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === "exp" ? sign = "-" : "+") + " " + int + "." + dec;
    };

    return {


        getInputData: function () {
            return {
                type: document.querySelector(inputDOM.type).value,
                description: document.querySelector(inputDOM.description).value,
                value: parseFloat(document.querySelector(inputDOM.value).value)
            }
        },



        addListItem: function (type, obj) {
            var markup, element;
            if (type === "inc") {
                element = ".income__list";
                markup = `<div class="item clearfix" id="inc-%id%">
            <div class="item__description">%description%</div>
            <div class="right clearfix">
                <div class="item__value">%value%</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
        </div>`

            } else if (type === "exp") {
                element = ".expenses__list"
                markup = `<div class="item clearfix" id="exp-%id%">
                <div class="item__description">%description%</div>
                <div class="right clearfix">
                    <div class="item__value">%value%</div>
                    <div class="item__percentage">21%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>`
            }

            newHTML = markup.replace("%id%", obj.id);
            newHTML = newHTML.replace("%description%", obj.desc);
            newHTML = newHTML.replace("%value%", formatNumber(obj.value, type));
            document.querySelector(element).insertAdjacentHTML("beforeend", newHTML);

        },

        deleteListItem: function (id) {
            var el = document.getElementById(id);
            el.parentNode.removeChild(el);
        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = "inc" : type = "exp";

            document.querySelector(inputDOM.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(inputDOM.expenseLabel).textContent = formatNumber(obj.totalExp, "exp");
            document.querySelector(inputDOM.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");

            if (obj.percentage > 0) {
                document.querySelector(inputDOM.totalPercent).textContent = obj.percentage + " %";
            } else {
                document.querySelector(inputDOM.totalPercent).textContent = "---"
            }
        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(inputDOM.itemsPercent);

            var nodeListForEach = function (list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + " %";
                } else {
                    current.textContent = "---"
                }

            })
        },

        displayMonth: function () {
            var now = new Date();
            var month = now.getMonth();
            var year = now.getFullYear();
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            var currentMonth = months[month];
            document.querySelector(inputDOM.dateMonth).textContent = currentMonth + " " + year;
        },

        clearFields: function () {
            document.querySelectorAll("input").forEach(el => el.value = "");
            document.querySelectorAll("input")[0].focus();
        },

        changeBoxColor: function () {
            document.querySelectorAll("input" + ",select").forEach(el => el.classList.toggle("red-focus"));
        },
        getDOMStrings: function () {
            return inputDOM;
        },
    }

})();

var appController = (function (budgetCTRL, uiCTRL) {
    var DOM = uiCTRL.getDOMStrings();
    var setupEvents = function () {
        document.querySelector(DOM.button).addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function (e) {
            if (e.keyCode === 13 || e.which === 13) {
                ctrlAddItem()
            }
        });

        document.querySelector(DOM.type).addEventListener("change", uiCTRL.changeBoxColor);

        document.querySelector(".container").addEventListener("click", ctrlDeleteItem);
    };

    var updateBudget = function () {
        var budget;
        // calculate budget
        budgetCTRL.calculateBudget();
        // return budget 
        budget = budgetCTRL.getBudget();
        //display budget 
        uiCTRL.displayBudget(budget);
    };

    var updatePercentages = function () {
        //1. Calculate in budget controller. 
        budgetCTRL.calculatePercentages();
        //2. Return the percentages. 
        var percs = budgetCTRL.getPercentages();
        //3. Update the percenates on UI 
        uiCTRL.displayPercentages(percs);
    };

    var ctrlAddItem = function () {
        //- get input data 
        var input = uiCTRL.getInputData();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //-store list of inc and exp
            var newItem = budgetCTRL.addItem(input.description, input.type, input.value);
            //-display list of income or exp on UI
            uiCTRL.addListItem(input.type, newItem);
            //clear the field
            uiCTRL.clearFields();
            //-calculate budget income - exp
            updateBudget();
            updatePercentages();

        };
    };

    var ctrlDeleteItem = function (e) {

        var itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {

            var splitItem = itemID.split("-");
            var type = splitItem[0];
            var id = parseInt(splitItem[1]);

            budgetCTRL.deleteItem(type, id);

            uiCTRL.deleteListItem(itemID);

            //3. Update and how new budget information
            updateBudget();
            updatePercentages();
        }
    };

    return {
        init: function () {
            console.log("This app has started now");
            uiCTRL.displayMonth();
            uiCTRL.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEvents();
        },
    }

})(budgetController, uiController);

appController.init(); 
