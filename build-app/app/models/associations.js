module.exports = (db) => {
  // User associations
  db.user.hasMany(db.advertisement, { foreignKey: 'userId', as: 'advertisements' });
  db.user.hasMany(db.order, { foreignKey: 'userId', as: 'orders' });
  db.user.hasMany(db.transaction, { foreignKey: 'senderId', as: 'sentTransactions' });
  db.user.hasMany(db.transaction, { foreignKey: 'receiverId', as: 'receivedTransactions' });
  db.user.hasMany(db.cart, { foreignKey: 'userId', as: 'cartItems' });
  db.user.hasMany(db.review, { foreignKey: 'userId', as: 'reviews' });
  db.user.hasMany(db.review, { foreignKey: 'targetUserId', as: 'receivedReviews' });

  // MaterialCategory associations (self-referencing for hierarchy)
  db.materialCategories.hasMany(db.materialCategories, { 
    foreignKey: 'parentCategoryId', 
    as: 'subcategories' 
  });
  db.materialCategories.belongsTo(db.materialCategories, { 
    foreignKey: 'parentCategoryId', 
    as: 'parentCategory' 
  });
  db.materialCategories.hasMany(db.material, { foreignKey: 'categoryId', as: 'materials' });

  // Material associations
  db.material.belongsTo(db.materialCategories, { foreignKey: 'categoryId', as: 'category' });
  db.material.hasMany(db.advertisement, { foreignKey: 'materialId', as: 'advertisements' });
  db.material.hasMany(db.review, { foreignKey: 'materialId', as: 'reviews' });

  // Advertisement associations
  db.advertisement.belongsTo(db.user, { foreignKey: 'userId', as: 'user' });
  db.advertisement.belongsTo(db.material, { foreignKey: 'materialId', as: 'material' });
  db.advertisement.hasMany(db.order, { foreignKey: 'advertisementId', as: 'orders' });
  db.advertisement.hasMany(db.cart, { foreignKey: 'advertisementId', as: 'cartItems' });
  db.advertisement.hasMany(db.review, { foreignKey: 'advertisementId', as: 'reviews' });

  // Order associations
  db.order.belongsTo(db.user, { foreignKey: 'userId', as: 'user' });
  db.order.belongsTo(db.advertisement, { foreignKey: 'advertisementId', as: 'advertisement' });
  db.order.hasMany(db.orderItem, { foreignKey: 'orderId', as: 'orderItems' });

  // OrderItem associations
  db.orderItem.belongsTo(db.order, { foreignKey: 'orderId', as: 'order' });
  db.orderItem.belongsTo(db.material, { foreignKey: 'materialId', as: 'material' });

  db.order.hasOne(db.transaction, { 
    foreignKey: 'referenceId', 
    sourceKey: 'id',
    scope: {
      referenceType: 'order'
    },
    as: 'transaction' 
  });

  // Transaction associations
  db.transaction.belongsTo(db.user, { foreignKey: 'senderId', as: 'sender' });
  db.transaction.belongsTo(db.user, { foreignKey: 'receiverId', as: 'receiver' });

  // Cart associations
  db.cart.belongsTo(db.user, { foreignKey: 'userId', as: 'user' });
  db.cart.belongsTo(db.advertisement, { foreignKey: 'advertisementId', as: 'advertisement' });

  // Review associations
  db.review.belongsTo(db.user, { foreignKey: 'userId', as: 'user' });
  db.review.belongsTo(db.user, { foreignKey: 'targetUserId', as: 'targetUser' });
  db.review.belongsTo(db.material, { foreignKey: 'materialId', as: 'material' });
  db.review.belongsTo(db.advertisement, { foreignKey: 'advertisementId', as: 'advertisement' });

  // Unique constraints are handled at model level with unique: true in model definitions
  // Additional indexes can be added here if needed
  // Example: db.advertisement.addIndex(['userId', 'title']);
};
