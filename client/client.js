$(document).keyup(function(e){
    var key = e.which;
    var del = 46;

    if (key == del){
        console.log('delete');
        var itemIdToDelete = $('.item.selected').last().attr('itemId');
        console.log(itemIdToDelete);
        Meteor.call('deleteItem', [itemIdToDelete]);
        }

    });

$(document).ready(function(){
    $('#checklists .items').sortable({
        handle: '.grip',
        stop: function(e, ui){
            $('#checklists .items > .item').each(function(i, el){
                Meteor.call('updateItem', $(el).attr('itemId'), {order: i});
                console.log(i);
                console.log($(el).attr('itemId'));
                });
            }
        });
    $('#tasks .items').sortable({
        handle: '.grip',
        stop: function(e, ui){
            $('#tasks .items > .item').each(function(i, el){
                Meteor.call('updateItem', $(el).attr('itemId'), {order: i});
                console.log(i);
                console.log($(el).attr('itemId'));
                });
            }
        });
    });

Meteor.subscribe('items');

Template.topbar.username = function(){
    return 'Chris Guilbeau'
}

Template.topbar.version = function(){
    return '0.0'
}

Template.checklists.items = function(){
    return Items.find({parentId: null}, {sort: {order: 1}});
}

Template.item.selected = function(itemId){
    if (
        (Session.get('currentChecklistId') == itemId) ||
        (Session.get('currentTaskId') == itemId)
        )
        return ' selected';
}

Template.checklists.events({
    'click button.new': function(e){
        Meteor.call('newItem', 'New Checklist', null);
        },
    });

Template.tasks.hasCurrentChecklistId = function(){
    if (Session.get('currentChecklistId')){
        return true;
        }
}

Template.tasks.items = function(){
    var currentChecklistId = Session.get('currentChecklistId');
    if (currentChecklistId)
        return Items.find({parentId: currentChecklistId}, {sort: {order: 1}});
}

Template.tasks.events({
    'click button.new': function(e){
        Meteor.call('newItem', 'New Task', Session.get('currentChecklistId'));
        }
    });

Template.item.getCheckedClass = function(checked){
    if (checked)
        return 'checked';
    else
        return 'unchecked';
}

Template.item.count = function(itemId){
    var total = Items.find({parentId: itemId}).count();
    var checked = Items.find({parentId: itemId, checked: true}).count();
    return '' + checked + '/' + total;
}

Template.item.events({
    'click div.item': function(e){
        function getVarToSet(){
            if ($(e.target).parents('#checklists').length > 0)
                return 'currentChecklistId';
            else
                return 'currentTaskId';
        }
        Session.set(
            getVarToSet(), $(e.target).parents('.item').attr('itemId'));
        },
    'blur div.item': function(e){
        var item = $(e.target);
        item.attr('contenteditable', false);
        var itemId = item.attr('itemId');
        var updates = {name: $.trim(item.text())};
        Meteor.call('updateItem', itemId, updates);
        },
    'dblclick div.item .name': function(e){
        console.log('dsa');
        var item = $(e.target);
        item.attr('contenteditable', true);
        item.focus();
        item.select();
        },
    'keypress div.item': function(e){
        var key = event.which || event.keyCode;
        if (key == 13){
            $(e.target).blur();
            e.preventDefault();
            }
        },
    'click .checker': function(e){
        var checker = $(e.target);
        var itemId = checker.attr('itemId');
        Meteor.call('updateItem', itemId, {checked: checker.hasClass('unchecked')});
        console.log(itemId);
        }
    });
