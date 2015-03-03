'use strict';


module.exports = function(sequelize, DataTypes) {
    var UsersRights = sequelize.define('UsersRights', {
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
                UsersRights.belongsTo(models.Period);
                UsersRights.belongsTo(models.Fundation);
                UsersRights.belongsTo(models.Point);
            }
        }
    });

    return UsersRights;
};