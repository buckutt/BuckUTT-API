'use strict';


module.exports = function(sequelize, DataTypes) {
    var ArticlesPoints = sequelize.define('ArticlesPoints', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        priority: {
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

    return ArticlesPoints;
};
