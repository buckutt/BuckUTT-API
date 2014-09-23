'use strict';


module.exports = function(sequelize, DataTypes) {
    var Article = sequelize.define('Article', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        name: {
            type: DataTypes.STRING
        },

        type: {
            type: DataTypes.ENUM,
            values: ['product', 'promotion']
        },

        stock: {
            type: DataTypes.INTEGER
        },

        isSingle: {
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
                Article.belongsTo(models.Fundation);
                Article.hasMany(Article, { 
                    as: 'Parents', 
                    through: models.ArticlesLinks 
                });
                Article.hasMany(models.Point, { 
                    as: 'SellingPlaces', 
                    through: models.ArticlesPoints 
                });
            }
        }
    });

    return Article;
};
