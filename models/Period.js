'use strict';


module.exports = function(sequelize, DataTypes) {
    var Period = sequelize.define('Period', {
        id: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, 

        name: { 
            type: DataTypes.STRING
        },

        startDate: { 
            type: DataTypes.DATE
        },

        endDate: {
            type: DataTypes.DATE
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
                Period.belongsTo(models.Fundation);
                Period.hasMany(models.Price, {
                    as: 'Prices'
                });
                Period.hasMany(models.DevicesPoints, {
                    as: 'DevicesPoints'
                });
                Period.hasMany(models.UsersGroups, { 
                    as: 'UsersGroups'
                });
                Period.hasMany(models.UsersRights, { 
                    as: 'UsersRights'
                });
            }
        }
    });

    return Period;
};
