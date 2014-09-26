'use strict';


module.exports = function(sequelize, DataTypes) {
    var Group = sequelize.define('Group', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        name: {
            type: DataTypes.STRING
        },

        isOpen: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
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
                Group.belongsTo(models.Fundation);
                Group.hasMany(models.Price, {
                    as: 'Prices'
                });
                Group.hasMany(models.User, { 
                    as: 'Users', 
                    through: models.UsersGroups
                });
            }
        }
    });

    return Group;
};
