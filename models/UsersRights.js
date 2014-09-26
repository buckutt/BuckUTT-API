'use strict';


module.exports = function(sequelize, DataTypes) {
    var UsersGroups = sequelize.define('UsersRights', {
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
                UsersGroups.belongsTo(models.Fundation);
                UsersGroups.belongsTo(models.Point);
            }
        }
    });

    return UsersGroups;
};