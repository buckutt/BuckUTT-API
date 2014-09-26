'use strict';


module.exports = function(sequelize, DataTypes) {
    var UsersGroups = sequelize.define('UsersGroups', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
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
                UsersGroups.belongsTo(models.Period);
            }
        }
    });

    return UsersGroups;
};