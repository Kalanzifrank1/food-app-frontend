import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useEffect } from "react";

const formSchema = z.object({
  searchQuery: z.string({
    required_error: "Restaurant name is required",
  }),
});

export type SearchForm = z.infer<typeof formSchema>;

type Props = {
  onSubmit: (formData: SearchForm) => void;
  placeHolder: string;
  onReset?: () => void;
  searchQuery?: string; // Made optional with default value
};

const SearchBar = ({ searchQuery = "", onSubmit, onReset, placeHolder }: Props) => {
  const form = useForm<SearchForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchQuery: ""  //searchQuery || "", // Ensure empty string as fallback
    },
  });

  // Sync with external searchQuery changes
  useEffect(() => { 
    form.reset({ searchQuery });
  }, [searchQuery, form]);

  const handleReset = () => {
    form.reset({ searchQuery: "" });
    onReset?.();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`flex items-center gap-3 border-2 rounded-full p-3  ${
          form.formState.errors.searchQuery ? "border-red-500" : ""
        }`}
      >
        <Search
          strokeWidth={2.5}
          size={30}
          className="ml-1 text-orange-500 hidden md:block"
        />
        <FormField
          control={form.control}
          name="searchQuery"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""} // Explicit nullish coalescing
                  className="border-none shadow-none text-xl focus-visible:ring-0"
                  placeholder={placeHolder}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <Button
          onClick={handleReset}
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={!form.formState.isDirty} // Disable when not dirty
        >
          Reset
        </Button>

        <Button type="submit" className="rounded-full bg-orange-500">
          Search
        </Button>
      </form>
    </Form>
  );
};

export default SearchBar;