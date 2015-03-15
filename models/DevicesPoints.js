'use strict';


module.exports = function(sequelize, DataTypes) {
    var DevicesPoints = sequelize.define('DevicesPoints', {
        id: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
         
        priority: {
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
                DevicesPoints.belongsTo(models.Period);
            }
        }
    });

    return DevicesPoints;
};