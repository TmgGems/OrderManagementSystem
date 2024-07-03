/// <reference path="order.model.js" />
/// <reference path="../knockout.js" />


const mode = {
    create: 1,
    update: 2
};
var OrderController = function () {
    var self = this;
    const baseUrl = "/api/OrderAPI";
    self.CurrentOrder = ko.observableArray([]);
    self.IsUpdated = ko.observable(false);
    self.SelectedOrder = ko.observable(new OrderItemVM());
    self.NewOrder = ko.observable(new OrderItemVM());
    self.mode = ko.observable(mode.create);
    self.IsUpdated = ko.observable(false);

    //Fetch Data From Server 
    self.getData = function ()
    {
        ajax.get(baseUrl).then(function (result) {
            self.CurrentOrder(result.map(item => new OrderItemVM(item)))
        })
    }

    self.getData();

    self.AddOrder = function ()
    {
        debugger
        ajax.post(baseUrl, ko.toJSON(self.NewOrder()))
            .done(function (result) {
                console.log("Data received", result);
                self.CurrentOrder.push(new OrderItemVM(result));
                self.resetFrom();
            })
    }


   
    // Delete Product

    self.DeleteProduct = function (model) {
        ajax.delete(baseUrl + "?id=" + model.OrderId())
            .done((result) => {
                self.CurrentOrder.remove(model);
            }).fail((err) => {
                console.log(err);
            });
    };
    //self.AddItem();

    self.SelectOrder = function (model) {

        debugger
        self.SelectedOrder(model);
        self.IsUpdated(true);
        self.mode(mode.update);
    }

   
    self.CloseModel = function () {
        self.resetFrom();
    }

    self.resetFrom = function () {

        self.SelectedOrder(new OrderItemVM());
        //self.mode(mode.create);
        self.IsUpdated(false);
    }

    //Remove Item
    self.RemoveItem = function (item) {
        self.SelectedOrder().Items.remove(item)
    };
    //Add Item
    self.AddItem = function () {
        self.SelectedOrder().Items.push(new ItemVM());
    };

    self.AddItem();

    self.totalAmount = ko.computed(function () {
        //debugger
        var total = self.SelectedOrder().Items().reduce(function (total, item) {
            var price = parseFloat(item.Price()) || 0; // Use item.Price() for observable
            var quantity = parseInt(item.Quantity()) || 0; // Use item.Quantity() for observable
         /*   console.log(`Calculating: Price=${price}, Quantity=${quantity}`); // Debugging*/
            return total + (price * quantity);
        }, 0);
       // console.log(`Total Amount: ${total.toFixed(2)}`); // Debugging
        return total.toFixed(2); // Round to 2 decimal places
    });

    //Save Item
    self.SaveOrder = function () {
       // debugger
        self.totalAmount();
        ko.toJS(self.SelectedOrder().TotalAmount = self.totalAmount());
        var order = ko.toJS(self.SelectedOrder)
        if (order.OrderId === 0) {
            order.OrderId = self.CurrentOrder().length + 1;
            self.CurrentOrder.push(ko.toJS(self.SelectedOrder));
        } else {
            var index = self.CurrentOrder().findIndex(o => o.OrderId() === order.OrderId);
            if (index !== -1) {
                self.CurrentOrder()[index] = new OrderItemVM(order);
                self.CurrentOrder.valueHasMutated();
            }
        }
        $('#orderModal').modal('hide');
        self.CloseModel();
        self.AddItem();
    };
}

var ajax =
{
    get: function (url) {
        return $.ajax({
            method: "GET",
            url: url,
            async: false,
        });
    },
    post: function (url, data) {
        return $.ajax({
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            url: url,
            data: (data)
        });
    },
    put: function (url, data) {
        return $.ajax({
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "PUT",
            url: url,
            data: data
        });
    },
    delete: function (route) {
        return $.ajax({
            method: "DELETE",
            url: route,
        });
    }
};