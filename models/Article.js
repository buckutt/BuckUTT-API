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
            type: DataTypes.INTEGER,
            defaultValue: -1
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
                    foreignKey: 'ArticleId',
                    through: models.ArticlesLinks 
                });

                Article.hasMany(Article, { 
                    as: 'Articles', 
                    foreignKey: 'ParentId',
                    through: models.ArticlesLinks 
                });

                Article.hasMany(models.Point, { 
                    as: 'SellingPlaces', 
                    through: models.ArticlesPoints 
                });

                Article.hasMany(models.Price, {
                    as: 'Prices'
                });
            }
        }
    });

    return Article;
};
