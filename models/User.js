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
                User.hasMany(models.MeanOfLogin, { 
                    as: 'MeanOfLogins', 
                    through: models.MeanOfLoginsUsers
                });
            }
        }
    });
    
    return User;
};