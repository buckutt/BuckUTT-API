'use strict';


module.exports = function(sequelize, DataTypes) {
    var Price = sequelize.define('Price', {
        id: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, 

        credit: { 
            type: DataTypes.INTEGER
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
                Price.belongsTo(models.Article);
                Price.belongsTo(models.Group);
                Price.belongsTo(models.Period);
            }
        }
    });

    return Price;
};