'use strict';


module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        id: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        password: { 
            type: DataTypes.STRING
        },

        pin: { 
            type: DataTypes.STRING
        },

        firstname: { 
            type: DataTypes.STRING
        },

        lastname: { 
            type: DataTypes.STRING
        },

        nickname: { 
            type: DataTypes.STRING
        },

        mail: { 
            type: DataTypes.STRING
        },

        credit: { 
            type: DataTypes.INTEGER
        },

        isTemporary: { 
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        failedAuth: { 
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
                User.belongsToMany(models.MeanOfLogin, {
                    through: models.MeanOfLoginsUsers
                });
                User.belongsToMany(models.Group, { 
                    as: 'Groups', 
                    through: models.UsersGroups
                });
                User.belongsToMany(models.Right, { 
                    as: 'Rights', 
                    through: models.UsersRights
                });
            }
        }
    });
    
    return User;
};