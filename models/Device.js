'use strict';


module.exports = function(sequelize, DataTypes) {
    var Device = sequelize.define('Device', {
        id: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, 

        device: { 
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
                Device.belongsToMany(models.Point, { 
                    as: 'Points', 
                    foreignKey: 'DeviceId',
                    through: models.PointsLinks
                });
            }
        }
    });

    return Device;
};
