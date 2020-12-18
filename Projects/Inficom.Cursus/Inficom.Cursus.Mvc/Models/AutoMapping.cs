using AutoMapper;
using Inficom.Cursus.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Inficom.Cursus.Mvc.Models
{
    public class AutoMapping : Profile
    {
        public AutoMapping()
        {
            CreateMap<Product, ProductModel>().ForMember(dest => dest.CategoryName, opts => opts.MapFrom(source => source.Category.CategoryName));
            CreateMap<ProductModel, Product>();
        }
    }
}
