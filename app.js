            //* * * * * * UI  CONTROLLER  * * * * *//

var UIcontroller=(function(){
    
    var DOM_strings={
        input_type: '.add__type',
        input_description:'.add__description',
        input_value:'.add__value',
        btn: '.add__btn',
        incomeContainer:'.income__list',
        expensesContainer:'.expenses__list',
        income_label:'.budget__income--value',
        expenses_label:'.budget__expenses--value',
        budget_label:'.budget__value',
        percent_label:'.budget__expenses--percentage',
        container:'.container',
        exp_percent_label:'.item__percentage',
        datelabel:'.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };
    var nodeForEach= function(list,callback){
        
        for(var i=0;i<list.length;i++){
        
            callback(list[i],i);
        }
    };
    
    return {
        getInput: function(){
            return{
                type: document.querySelector(DOM_strings.input_type).value,
                description:document.querySelector(DOM_strings.input_description).value,
                value: parseFloat(document.querySelector(DOM_strings.input_value).value)
            };
        },
        
        addListItem:function(obj,type){

            // Create HTML string with placeholder text 
                var htmlcode,newHtml,element;
                if(type === 'inc')
                {
                    element=DOM_strings.incomeContainer;
                    htmlcode='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }
                
                else if(type ==='exp')
                {
                    element=DOM_strings.expensesContainer;
                    htmlcode='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
                }
                    
            //Replace the place holder text with some actual data 
                newHtml=htmlcode.replace("%id%",obj.id,type);
                newHtml=newHtml.replace("%description%",obj.description,type);
                newHtml=newHtml.replace("%value%",formatNumber(obj.value,type));
            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },

        deleteListItem:function(selectorID){
            var item=document.getElementById(selectorID);
            item.parentNode.removeChild(item);
        },

        clearFields:function(){
            var clrdsc=document.querySelector(DOM_strings.input_description);
            document.querySelector(DOM_strings.input_value).value="";
            clrdsc.value="";
            clrdsc.focus();
        },

        displayBudget:function(obj){
            var type;
            obj.budget>0 ? type='inc' : type='exp';
            document.querySelector(DOM_strings.income_label).textContent=formatNumber(obj.totalINC,'inc');
            document.querySelector(DOM_strings.expenses_label).textContent=formatNumber(obj.totalEXP,'exp');
            document.querySelector(DOM_strings.budget_label).textContent=formatNumber(obj.budget,type);
            
            if(obj.percent>0)
                document.querySelector(DOM_strings.percent_label).textContent=obj.percent+'%';
            else
                document.querySelector(DOM_strings.percent_label).textContent='--';
        },
        
        displayPercentages:function(perc){
            var percent_fields=document.querySelectorAll(DOM_strings.exp_percent_label);
            
            nodeForEach(percent_fields,function(current,index){
                if(perc[index]>0)
                    current.textContent=perc[index]+'%';
                else
                    current.textContent='--';
            });
        },
        displayMonth:function(){
            var now,month,year,months;
            months=['January','February','March','April','May','June','July','August','Septempber','October','November','December'];
            now=new Date();
            year=now.getFullYear();
            month=now.getMonth();
            document.querySelector(DOM_strings.datelabel).textContent=months[month]+', '+year;
        },
        changeType:function(){
            var fields=document.querySelectorAll(
                DOM_strings.input_type+', '+ DOM_strings.input_description + ', '+ DOM_strings.input_value);
            nodeForEach(fields,function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOM_strings.btn).classList.toggle('red');
        },

        getDOMStrings: function(){
            return DOM_strings
        }

    };
})();


        //* * * * * BUDGET  CONTROLLER * * * * *

var budgetController=(function(){
    
    var Income=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    };

    var Expense=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    };

    Expense.prototype.calcPercentage=function(totalIncome){
        if(totalIncome>0)
        this.percentage=Math.round((this.value/totalIncome)*100);
        else 
        this.percentage=-1;

    };
    Expense.prototype.getPercentage=function(){
        return this.percentage;
    };

    var calculateTotal=function(type){
        var sum=0;
        data.allItems[type].forEach(function(current)
        {   
            sum+=current.value;
        });
        data.totals[type]=sum;
    }

    var data={
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1
    };

    return{
        addItem: function(type,des,val){
            var newItem,ID;
            //Create new ID
            if(data.allItems[type].length > 0)
                ID=data.allItems[type][data.allItems[type].length-1].id +1;
            else   
            ID=0;

            //Create new item based on type
            if(type === 'exp')
                newItem=new Expense(ID,des,val);
            else if(type === 'inc')
                newItem=new Income(ID,des,val);
            // Adding item to our data structure
            data.allItems[type].push(newItem);
            //Return new item
            return newItem; 
        },
        
        calculateBudget : function(){

            // calculate total expenses and income
                calculateTotal('exp');
                calculateTotal('inc');
            //calculate income-expenses
                data.budget=data.totals.inc-data.totals.exp;
            //calulate budget in percentage
            if(data.totals.inc>0)
                data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
            else
                data.percentage=-1;
        },

        calculatePercentages:function(){
             data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
             });
        },
        getPercentages:function(){
            var allPercentages=data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPercentages;

        },
        deleteItem:function(type,id){
            var index,ids;
            ids=data.allItems[type].map(function(current){
                return current.id;
            });
            console.log(ids);
            index=ids.indexOf(id);
            if(index !== -1)
                data.allItems[type].splice(index,1);
            
        },
        getBudget:function() {
           return {
            budget:data.budget,
            totalINC:data.totals.inc,
            totalEXP:data.totals.exp,
            percent:data.percentage
           }
        },
        testing:function(){
            console.log(data);
        }
    };

})();

                            //* * * * * CONTROLLER * * * * *  

var controller=(function(UICtrl,budgetCtrl){

    var setupEventListeners=function(){                     //
        var dom=UICtrl.getDOMStrings();
        document.querySelector(dom.btn).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress',function(event){
            if(event.keyCode===13)
                ctrlAddItem();
        });
        document.querySelector(dom.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(dom.input_type).addEventListener('change',UICtrl.changeType); 
    };
    
    var updateBudget=function(){
        //1. Calculate the budget
        budgetCtrl.calculateBudget();
        //2. Return the budget 
        var budget=budgetCtrl.getBudget();
        //3. Display the budget on UI
        UICtrl.displayBudget(budget);
        //console.log(budget);
    };

    var calculatePercentages=function(){
        //1. calculate percentages
        budgetCtrl.calculatePercentages();
        //2.Get the percentages from the budget controller
        var  percentages=budgetCtrl.getPercentages();
        //3. Update UI
        UICtrl.displayPercentages(percentages);
        // console.log(percentages);


    }

    var ctrlAddItem=function(){
        // 1. Get the field input data

        var input=UICtrl.getInput();
       // console.log(input);
        if(input.description !=="" && !isNaN(input.value) && input.value >0)
        {
            //2. Add the item to budget controller
            
            var newItem=budgetCtrl.addItem(input.type,input.description,input.value);
            
            //4.Clear the fields

            UICtrl.clearFields();

            //3. Add the item to the UI

            UICtrl.addListItem(newItem,input.type);

            //4. Update budget

            updateBudget();

            //4. Calculate and update percentages
                calculatePercentages();
        }

    };  
    var ctrlDeleteItem=function(event){
        var itemID,splitID,type,id;
        itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID=itemID.split('-');
            type=splitID[0];
            id=parseInt(splitID[1]);
           // console.log(`${type},${id}`);
        }
        //1. Delete item from data structure
        budgetCtrl.deleteItem(type,id);
        //2. Delete item from the UI
        UICtrl.deleteListItem(itemID);
        //3.Update and show new budget 
        updateBudget();
        //4. Calculate and update percentages
        calculatePercentages();
    };

    return {
        init: function(){
            setupEventListeners();
            UICtrl.displayMonth();
            UICtrl.displayBudget(budgetCtrl.getBudget());
            UICtrl.clearFields();
        }
    };

})(UIcontroller,budgetController);
controller.init();