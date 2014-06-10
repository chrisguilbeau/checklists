$(document).keyup(function(e){
    var key = e.which;
    var del = 46;

    if (key == del){
        console.log('delete');
        var itemIdToDelete = $('.item.selected').last().attr('itemId');
        console.log(itemIdToDelete);
        Meteor.call('deleteItems', [itemIdToDelete]);
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
    $('#tasks > .items').sortable({
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

Template.item.rendered = function(){
    $('.children.items').sortable({
        handle: '.grip',
        stop: function(e, ui){
            console.log(e.target);
            console.log($(ui.helper));
            console.log($(ui.helper).attr('itemId'));
            // $('#tasks .items > .item').each(function(i, el){
            //     Meteor.call('updateItem', $(el).attr('itemId'), {order: i});
            //     console.log(i);
            //     console.log($(el).attr('itemId'));
            //     });
            }
        });
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

function hasCurrentTaskId(){
    if (Session.get('currentTaskId')){
        return true;
        }
}

Template.tasks.hasCurrentTaskId = hasCurrentTaskId;
Template.item.hasCurrentTaskId = hasCurrentTaskId;
Template.tasks.showSubtaskButton = function(){
    if (Session.get('currentTaskId') && Session.get('currentChecklistId')){
        return true;
        }
}

Template.tasks.items = function(){
    var currentChecklistId = Session.get('currentChecklistId');
    if (currentChecklistId)
        return Items.find({parentId: currentChecklistId}, {sort: {order: 1}});
}

Template.item.items = function(parentId){
    console.log(parentId);
    return Items.find({parentId: parentId}, {sort: {order: 1}});
}

Template.tasks.events({
    'click button.sub': function(e){
        Meteor.call('newItem', 'New Task', Session.get('currentTaskId'));
        },
    'click button.new': function(e){
        Meteor.call('newItem', 'New Task', Session.get('currentChecklistId'));
        }
    });

Template.item.checkedProp = function(checked){
    console.log(checked);
    if (checked)
        return 'checked';
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
    'click input[type=checkbox]': function(e){
        var checkbox= $(e.target);
        var itemId = checkbox.parents('.item').attr('itemId');
        var isChecked = checkbox.prop('checked');
        console.log(itemId);
        console.log(isChecked);
        Meteor.call('updateItem', itemId, {'checked': isChecked});
        console.log(itemId);
        }
    });
