'use strict';


module.exports = function(sequelize, DataTypes) {
    var ArticlesLinks = sequelize.define('ArticlesLinks', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        //Dunno what's that for but it's part of the specs
        step: {
            type: DataTypes.INTEGER
        },

        isRemoved: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },

    {
        timestamps: false
    });

    return ArticlesLinks;
};
