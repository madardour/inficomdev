using Inficom.Demo.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Inficom.Demo.Data.Mappings
{
    public class ProductMapping
    {
        internal static Expression<Func<Product, ProductModel>> GetProductPredicate()
        {
            Expression<Func<Product, ProductModel>> predicate = x => new ProductModel
            {
                ProductID = x.ProductID,
                ProductName = x.ProductName,
                SupplierID = x.SupplierID,
                CategoryName = x.Category.CategoryName,
                QuantityPerUnit = x.QuantityPerUnit,
                UnitPrice = x.UnitPrice,
                UnitsInStock = x.UnitsInStock,
                UnitsOnOrder = x.UnitsOnOrder,
                ReorderLevel = x.ReorderLevel
            };

            return predicate;
        }

        internal static Product ToDataEntity(ProductModel entity)
        {
            return new Product
            {
                ProductID = entity.ProductID,
                ProductName = entity.ProductName,
                SupplierID = entity.SupplierID,
                CategoryID = entity.CategoryID,
                QuantityPerUnit = entity.QuantityPerUnit,
                UnitPrice = entity.UnitPrice,
                UnitsInStock = entity.UnitsInStock,
                UnitsOnOrder = entity.UnitsOnOrder,
                ReorderLevel = entity.ReorderLevel
            };
        }

        internal static ProductModel ToModelEntity(Product entity)
        {
            return new ProductModel
            {
                ProductID = entity.ProductID,
                ProductName = entity.ProductName,
                SupplierID = entity.SupplierID,
                CategoryName = entity.Category.CategoryName,
                QuantityPerUnit = entity.QuantityPerUnit,
                UnitPrice = entity.UnitPrice,
                UnitsInStock = entity.UnitsInStock,
                UnitsOnOrder = entity.UnitsOnOrder,
                ReorderLevel = entity.ReorderLevel
            };
        }
    }
}
