function getUserId(){
    return 'cg';
}

Meteor.methods({
    newItem: function(name, parentId){
        var userId = getUserId();
        item = {
            canSee: [userId],
            canEdit:[userId],
            name: name,
            parentId: parentId,
            checked: false,
            order: 0
            }
        Items.insert(item);
        },
    updateItem: function(itemId, updates){
        var query = {_id: itemId};
        Items.update(query, {$set: updates});
        },
    deleteItem: function(itemIds){
        Items.remove({_id: {$in: itemIds}});
        }
    });
