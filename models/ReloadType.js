'use strict';

module.exports = function(sequelize, DataTypes) {
    var ReloadType = sequelize.define('ReloadType', {
        id: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, 

        name: { 
            type: DataTypes.STRING
        },

        mode: { 
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
                ReloadType.hasMany(models.Reload, {
                    as : 'Reloads'
                });
            }
        }
    });

    return ReloadType;
};