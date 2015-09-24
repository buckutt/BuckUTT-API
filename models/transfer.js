'use strict';


module.exports = function(sequelize, DataTypes) {
    var Transfer = sequelize.define('Transfer', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        date: {
            type: DataTypes.DATE
        },

        amount: {
            type: DataTypes.INTEGER
        },

        isRemoved: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: false,
        classMethods: {
            associate: function(models) {
                Transfer.belongsTo(models.Point);
                Transfer.belongsTo(models.User, {
                    as: 'From',
                    foreignKey: 'FromId'
                });

                Transfer.belongsTo(models.User, {
                    as: 'To',
                    foreignKey: 'ToId'
                });
            }
        }
    });

    return Transfer;
};
