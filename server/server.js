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
        console.log(query);
        console.log(updates);
        Items.update(query, {$set: updates});
        },
    deleteItems: function(itemIds){
        console.log(itemIds);
        Items.remove({_id: {$in: itemIds}});
        }
    });
