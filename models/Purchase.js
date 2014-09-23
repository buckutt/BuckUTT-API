'use strict';


module.exports = function(sequelize, DataTypes) {
    var Purchase = sequelize.define('Purchase', {
        id: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, 

        date: { 
            type: DataTypes.DATE
        },

        price: { 
            type: DataTypes.INTEGER
        },

        ip: {
            type: DataTypes.STRING
        },

        isRemoved: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },

    {
        timestamps: false,
        classMethods: {
            associate: function(models) {
                Purchase.belongsTo(models.Article);
                Purchase.belongsTo(models.Point);
                Purchase.belongsTo(models.Fundation);
                Purchase.belongsTo(models.User, { 
                    as: 'Buyer', 
                    foreignKey: 'BuyerId' 
                });
                Purchase.belongsTo(models.User, { 
                    as: 'Seller', 
                    foreignKey: 'SellerId' 
                });
            }
        }
    });

    return Purchase;
};
