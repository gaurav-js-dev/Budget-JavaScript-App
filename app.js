var budgetController = (function () {
    var Expense = function (id, descripition, value) {
        this.descripition = descripition;
        this.value = value;
        this.id = id;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, descripition, value) {
        this.descripition = descripition;
        this.value = value;
        this.id = id;
    };

    var caclculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(cur => {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, des, val) {
            var newitem, id;
            // create new id

            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                id = 0;
            };
            // create new item based on "inc" and "exp" type

            if (type === "exp") {
                newitem = new Expense(id, des, val);
            } else if (type === "inc") {
                newitem = new Income(id, des, val);
            }
            //push it into data structure
            data.allItems[type].push(newitem);

            //  [1,6,9,10,12]
            return newitem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            // first get all the id in a new array ids 

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            // then find the position or index of entered id i.e income-5 or expendse-5
            index = ids.indexOf(id);

            if (index !== -1) {

                // delete the item of that position
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            // caclculate total inc and exp 
            caclculateTotal("exp");
            caclculateTotal("inc");

            // calculate budget income - expense
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the % of income spent 
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
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

        getbudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function () {
            console.log(data);
        }

    };
})();

var UIController = (function () {
    var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLablel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expendsesPercLabel: ".item__percentage",
        dateLablel: ".budget__title--month"
    }

    const formatNumber = function (num, type) {
        let numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)
        }

        dec = numSplit[1];

        return (type === 'exp' ? sign = '-' : '+') + ' ' + int + '.' + dec
    }

    return {
        getinput: function () {

            return {
                type: document.querySelector(DOMstrings.inputType).value,
                descripition: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHTML, element;

            if (type === "inc") {
                element = DOMstrings.incomeContainer;
                html = `<div class="item clearfix" id="inc-%id%"><div class="item__description">%descripition%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
            } else if (type === "exp") {
                element = DOMstrings.expenseContainer;
                html = `                        <div class="item clearfix" id="exp-%id%">
            <div class="item__description">%descripition%</div>
            <div class="right clearfix">
                <div class="item__value">%value%</div>
                <div class="item__percentage">21%</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
        </div>`;
            }
            newHTML = html.replace("%id%", obj.id);
            newHTML = newHTML.replace("%descripition%", obj.descripition);
            newHTML = newHTML.replace("%value%", formatNumber(obj.value, type));
            document.querySelector(element).insertAdjacentHTML("beforeend", newHTML);
        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            document.querySelectorAll("input").forEach(field => field.value = "");
            document.querySelectorAll("input")[0].focus();
        },

        dispayBudget: function (obj) {
            let type;
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLablel).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp");


            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";
            }
        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMstrings.expendsesPercLabel);

            var nodeListForEach = function (list, callback) {
                for (let i = 0; i < list.length; i++) {
                    callback(list[i], i)
                }
            }

            nodeListForEach(fields, function (current, index) {
                current.textContent = percentages[index] + "%";
            });

        },

        displayDate: function () {
            var now, month, months, year;
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLablel).textContent = `${months[month]} ${year}`;
        },

        changetype: function () {
            document.querySelectorAll("input" + ",select").forEach(el => el.classList.toggle("red-focus"));
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };

})();

var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {

        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function (e) {
            if (e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changetype);
    };

    var updateBudget = function () {
        // 1. Calculate and budget
        budgetCtrl.calculateBudget();
        // 2. Return the budget
        var budget = budgetCtrl.getbudget();

        // 3. Display budget in UI
        UICtrl.dispayBudget(budget);
    };

    var updatePercentages = function () {
        // 1.Calcuate the percentages.
        budgetCtrl.calculatePercentages();

        // 2.Read from Budget controller 
        var percentages = budgetCtrl.getPercentages();

        //3. Update the UI from new percentages
        UIController.displayPercentages(percentages);
    };

    var ctrlAddItem = function () {
        var input, newItem;
        // 1. Get the input values
        input = UICtrl.getinput();

        if (input.descripition !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.descripition, input.value);
            // 3. add the new item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. clear the field
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            //6. Cacluate and update the percentages 

            updatePercentages();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, id;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split("-");
            type = splitID[0];
            id = parseInt(splitID[1]);

            //1. delete the item from data structure
            budgetCtrl.deleteItem(type, id);

            //2. delete the item from UI 
            UICtrl.deleteListItem(itemID)


            //3. update and show the new budget
            updateBudget();

            //4. Cacluate and update the percentages 

            updatePercentages();
        }
    };

    return {
        init: function () {
            console.log("The app is working now");
            UICtrl.displayDate();
            UICtrl.dispayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            }
            );
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();
