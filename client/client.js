var PREVENT_ENTER_ONCE = false;

$(document).keyup(function(e){
    var key = e.which;
    var keys = {
        del: 46,
        down: 40,
        enter: 13,
        left: 37,
        right: 39,
        up: 38,
        _z: null
        };
    console.log(key);
    function moveDown(){
        var items = $('.item');
        var current = $('.item.selected').last();
        var index = items.index(current);
        $(items[index + 1]).children('.name').click();
    }
    switch(key){
        case keys.right:
            if (!Session.get('currentTaskId'))
                $('#tasks .item').first().find('.name').click();
            break;
        case keys.left:
            Session.set('currentTaskId', null);
            break
        case keys.enter:
            if (PREVENT_ENTER_ONCE){
                PREVENT_ENTER_ONCE = false;
                break;
            }
            var selectedItem = $('.selected.item').last();
            if (selectedItem.length > 0  && $('.item.selected .name:focus').length == 0){
               console.log('make a new one!');
               selectedItem.parents('#checklists, #tasks').first().find('button.new').click();
               break;
            }
        case keys.del:
            var currentItem = $('.item.selected').last();
            var itemIdToDelete = currentItem.attr('itemId');
            moveDown();
            Meteor.call('deleteItems', [itemIdToDelete]);
            break;
        case keys.down:
            moveDown();
            break;
        case keys.up:
            var items = $('.item');
            var current = $('.item.selected').last();
            var index = items.index(current);
            $(items[index - 1]).children('.name').click();
            break;
        }
    });

$(document).ready(function(){
    $('#checklists .items').sortable({
        handle: '.grip',
        stop: function(e, ui){
            $('#checklists .items .item').each(function(i, el){
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
        var order = Items.find({parentId: null}).count();
        if (Session.get('currentChecklistId')){
            order = $.parseJSON(
                $('#checklists .item.selected').attr('order'));
        }
        Meteor.call('newItem', '', null, order, function(err, result){
            console.log(result);
            $('.item[itemId=' + result + '] .name').click().dblclick();
            });
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
    return Items.find({parentId: parentId}, {sort: {order: 1, timestamp: -1}});
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
    'blur div.name': function(e){
        var name = $(e.target);
        var itemId = name.attr('itemId');
        var nameText = $.trim(name.text());
        var updates = {name: nameText};
        $('.name').attr('contenteditable', false);
        Meteor.call('updateItem', itemId, updates, function(err, result){
            // this is a fix to a known bug in 8.0 where
            // contenteditable divs double their refresh in Blaze
            name.text(nameText);
            });
        },
    'dblclick div.name': function(e){
        var item = $(e.target);
        item.attr('contenteditable', true);
        item.focus();
        },
    'keypress div.name': function(e){
        var key = event.which || event.keyCode;
        if (key == 13){
            $(e.target).blur();
            e.preventDefault();
            PREVENT_ENTER_ONCE = true;
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
