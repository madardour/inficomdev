using Inficom.Learning.Data.Entities;
using Inficom.Learning.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;

namespace Inficom.Learning.Data.Mappings
{
    public class ProductsMapping
    {
        internal static Expression<Func<Products, ProductsModel>> GetProductPredicate()
        {
            Expression<Func<Products, ProductsModel>> predicate = x => new ProductsModel
            {
                ProductID = x.ProductId,
                ProductName = x.ProductName,
                SupplierID = x.SupplierId,
                CategoryID = x.CategoryId,
                CategoryName = x.Category.CategoryName,
                QuantityPerUnit = x.QuantityPerUnit,
                UnitPrice = x.UnitPrice,
                UnitsInStock = x.UnitsInStock,
                UnitsOnOrder = x.UnitsOnOrder,
                ReorderLevel = x.ReorderLevel
            };

            return predicate;
        }

        internal static Products ToDataEntity(ProductsModel entity)
        {
            return new Products
            {
                ProductId = entity.ProductID,
                ProductName = entity.ProductName,
                SupplierId = entity.SupplierID,
                CategoryId = entity.CategoryID,
                QuantityPerUnit = entity.QuantityPerUnit,
                UnitPrice = entity.UnitPrice,
                UnitsInStock = entity.UnitsInStock,
                UnitsOnOrder = entity.UnitsOnOrder,
                ReorderLevel = entity.ReorderLevel
            };
        }

        internal static ProductsModel ToModelEntity(Products entity)
        {
            return new ProductsModel
            {
                ProductID = entity.ProductId,
                ProductName = entity.ProductName,
                SupplierID = entity.SupplierId,
                CategoryID = entity.CategoryId,
                CategoryName = entity.Category != null ? entity.Category.CategoryName : string.Empty,
                QuantityPerUnit = entity.QuantityPerUnit,
                UnitPrice = entity.UnitPrice,
                UnitsInStock = entity.UnitsInStock,
                UnitsOnOrder = entity.UnitsOnOrder,
                ReorderLevel = entity.ReorderLevel
            };
        }
    }
}
