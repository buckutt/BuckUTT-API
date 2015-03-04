'use strict';


module.exports = function(sequelize, DataTypes) {
    var PointsLinks = sequelize.define('PointsLinks', {
        id: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, 

        device: { 
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
                PointsLinks.belongsTo(models.Point);
            }
        }
    });

    return PointsLinks;
};