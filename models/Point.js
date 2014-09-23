'use strict';


module.exports = function(sequelize, DataTypes) {
    var Point = sequelize.define('Point', {
        id: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, 

        name: { 
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
                Point.hasMany(models.Article, { 
                    as: 'Products', 
                    through: models.ArticlesPoints 
                });
            }
        }
    });

    return Point;
};
