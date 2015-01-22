'use strict';


module.exports = function(sequelize, DataTypes) {
    var Right = sequelize.define('Right', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        name: {
            type: DataTypes.STRING
        },

        description: {
            type: DataTypes.STRING
        },

        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
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
                Right.belongsToMany(models.User, { 
                    as: 'Users', 
                    through: models.UsersRights
                });
            }
        }
    });

    return Right;
};
