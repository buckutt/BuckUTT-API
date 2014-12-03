'use strict';

//Shotgun !
module.exports = function(sequelize, DataTypes) {
    var Reload = sequelize.define('Reload', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        date: {
            type: DataTypes.DATE
        },

        credit: {
            type: DataTypes.INTEGER
        },

        trace: {
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
                Reload.belongsTo(models.ReloadType);
                Reload.belongsTo(models.User, {
                    as: 'Buyer',
                    foreignKey: 'BuyerId'
                });
                Reload.belongsTo(models.User, {
                    as: 'Operator',
                    foreignKey: 'OperatorId'
                });
                Reload.belongsTo(models.Point);
            }
        }
    });

    return Reload;
};